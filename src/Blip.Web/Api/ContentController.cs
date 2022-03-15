using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
#if NETCOREAPP
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Dictionary;
using Umbraco.Cms.Core.Mapping;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Extensions;
#else
using System.Web.Http;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Dictionary;
using Umbraco.Core.Mapping;
using Umbraco.Core.Models;
using Umbraco.Core.Scoping;
using Umbraco.Core.Services;
using Umbraco.Web.Actions;
using Umbraco.Web.Models.ContentEditing;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using IUmbracoMapper = Umbraco.Core.Mapping.UmbracoMapper;
#endif

namespace Blip.Web
{
    public class ScaffoldModel
    {
        public Guid[] ContentTypeKeys { get; set; }
        public int ParentId { get; set; }
    }

    [DataContract(Name = "content", Namespace = "")]
    public class ContentSlim
    {
        [DataMember(Name = "variants")]
        public IEnumerable<ContentVariantDisplay> Variants { get; set; }
        
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "allowedActions")]
        public IEnumerable<string> AllowedActions { get; set; }
    }

    [PluginController("Blip")]
    public class ContentController : UmbracoAuthorizedApiController
    {
        private readonly IScopeProvider _scopeProvider;
        private readonly IContentTypeService _contentTypeService;
        private readonly ILocalizedTextService _localizedTextService;
        private readonly IBackOfficeSecurityAccessor _backofficeSecurityAccessor;
        private readonly IContentService _contentService;
        private readonly IUmbracoMapper _umbracoMapper;
        private readonly ICultureDictionary _cultureDictionary;
#if NETCOREAPP
        public ContentController(
            IScopeProvider scopeProvider, 
            IContentTypeService contentTypeService, 
            ILocalizedTextService localizedTextService, 
            IBackOfficeSecurityAccessor backofficeSecurityAccessor, 
            IContentService contentService, 
            IUmbracoMapper umbracoMapper, 
            ICultureDictionary cultureDictionary)
#else
        public ContentController(
            IScopeProvider scopeProvider,
            IContentTypeService contentTypeService,
            ILocalizedTextService localizedTextService,
            IBackOfficeSecurityAccessor backofficeSecurityAccessor,
            IUserService userService,
            IContentService contentService,
            IUmbracoMapper umbracoMapper)
#endif
        {
            _scopeProvider = scopeProvider;
            _contentTypeService = contentTypeService;
            _localizedTextService = localizedTextService;
            _backofficeSecurityAccessor = backofficeSecurityAccessor;
            _contentService = contentService;
            _umbracoMapper = umbracoMapper;
#if NETCOREAPP
            _cultureDictionary = cultureDictionary;
#else
            _cultureDictionary = Current.CultureDictionaryFactory.CreateDictionary();
#endif
        }


        public ContentSlim GetById(Udi id)
        {
            var guidUdi = id as GuidUdi;
            if (guidUdi == null) return null;

            var foundContent = GetObjectFromRequest(() => _contentService.GetById(guidUdi.Guid));
            if (foundContent == null) return null;

            var currentUser = _backofficeSecurityAccessor.BackOfficeSecurity.CurrentUser;

            var content = MapToDisplay(foundContent, context =>
            {
                context.Items["CurrentUser"] = currentUser;
            });

            var slim = new ContentSlim
            {
                Id = content.Id,
                Variants = content.Variants,
                AllowedActions = content.AllowedActions,
            };

            // if the user has a start Id, and the node is outside any of those ids,
            // remove the browse permission
            if (currentUser.StartContentIds.Any())
            {
                var pathIds = foundContent.Path.Split(',').Select(int.Parse);
                if (!pathIds.Intersect(currentUser.StartContentIds).Any())
                {
                    slim.AllowedActions = content.AllowedActions.Except(new string[]{
                            ActionBrowse.ActionLetter.ToString(),
                            ActionUpdate.ActionLetter.ToString()
                        });
                }
            }

            return slim;
        }

        /// <summary>
        /// Gets a collection of empty content items for all document types.
        /// </summary>
        /// <param name="contentTypeKeys"></param>
        /// <param name="parentId"></param>
#if NETCOREAPP
        [HttpPost]
        public ActionResult<IDictionary<Guid, ContentItemDisplay>> GetEmptyByKeys(ScaffoldModel model)
#else
        [HttpPost]
        public IDictionary<Guid, ContentItemDisplay> GetEmptyByKeys(ScaffoldModel model)
#endif
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            var contentTypes = _contentTypeService.GetAll(model.ContentTypeKeys).ToList();
            return GetEmpties(contentTypes, model.ParentId).ToDictionary(x => x.ContentTypeKey);
        }

        /// <summary>
        /// Gets an empty <see cref="ContentItemDisplay"/> for each content type in the IEnumerable, all with the same parent ID
        /// </summary>
        /// <remarks>Will attempt to re-use the same permissions for every content as long as the path and user are the same</remarks>
        /// <param name="contentTypes"></param>
        /// <param name="parentId"></param>
        /// <returns></returns>
        private IEnumerable<ContentItemDisplay> GetEmpties(IEnumerable<IContentType> contentTypes, int parentId)
        {
            var result = new List<ContentItemDisplay>();

            var backOfficeSecurity = _backofficeSecurityAccessor.BackOfficeSecurity;
            var userId = backOfficeSecurity.GetUserId().ResultOr(0);
            var currentUser = backOfficeSecurity.CurrentUser;

            foreach (var contentType in contentTypes)
            {
                var emptyContent = _contentService.Create("", parentId, contentType, userId);

                var mapped = MapToDisplay(emptyContent, context =>
                {
                    context.Items["CurrentUser"] = currentUser;
                });

                result.Add(CleanContentItemDisplay(mapped));
            }

            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="display"></param>
        /// <returns></returns>
        private ContentItemDisplay CleanContentItemDisplay(ContentItemDisplay display)
        {
            // translate the content type name if applicable
            display.ContentTypeName = UmbracoDictionaryTranslate(_localizedTextService, display.ContentTypeName, _cultureDictionary);

            // if your user type doesn't have access to the Settings section it would not get this property mapped
            if (display.DocumentType != null)
                display.DocumentType.Name = UmbracoDictionaryTranslate(_localizedTextService, display.DocumentType.Name, _cultureDictionary);

            //remove the listview app if it exists
            display.ContentApps = display.ContentApps.Where(x => x.Alias != "umbListView").ToList();

            return display;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="manager"></param>
        /// <param name="text"></param>
        /// <param name="cultureDictionary"></param>
        /// <returns></returns>
        private string UmbracoDictionaryTranslate(ILocalizedTextService manager, string text, ICultureDictionary cultureDictionary)
        {
            if (text == null)
                return null;

            if (text.StartsWith("#") == false)
                return text;

            text = text.Substring(1);
            var value = cultureDictionary[text];
            if (value.IsNullOrWhiteSpace() == false)
            {
                return value;
            }

            var splitValues = text.Split('_');
            value = manager.Localize(splitValues[0], splitValues[1]);

            return value.StartsWith("[") ? text : value;
        }

        /// <summary>
        /// Used to map an <see cref="IContent"/> instance to a <see cref="ContentItemDisplay"/> and ensuring AllowPreview is set correctly.
        /// Also allows you to pass in an action for the mapper context where you can pass additional information on to the mapper.
        /// </summary>
        /// <param name="content"></param>
        /// <param name="contextOptions"></param>
        /// <returns></returns>
        private ContentItemDisplay MapToDisplay(IContent content, Action<MapperContext> contextOptions)
        {
            var display = _umbracoMapper.Map<ContentItemDisplay>(content, contextOptions);
            display.AllowPreview = display.AllowPreview && content.Trashed == false && content.ContentType.IsElement == false;
            return display;
        }


        /// <summary>
        /// Checks if the request contains the key and the item is not null, if that is the case, return it from the request, otherwise return it from the callback
        /// </summary>
        /// <typeparam name="TPersisted"></typeparam>
        /// <param name="getFromService"></param>
        /// <returns></returns>
        protected TPersisted GetObjectFromRequest<TPersisted>(Func<TPersisted> getFromService)
        {
#if NETCOREAPP
            return HttpContext.Items.ContainsKey(typeof(TPersisted).ToString()) && HttpContext.Items[typeof(TPersisted).ToString()] != null
                ? (TPersisted)HttpContext.Items[typeof(TPersisted).ToString()]
                : getFromService();
#else
            return Request.Properties.ContainsKey(typeof(TPersisted).ToString()) && Request.Properties[typeof(TPersisted).ToString()] != null
                ? (TPersisted)Request.Properties[typeof(TPersisted).ToString()]
                : getFromService();
#endif
        }
    }
}
