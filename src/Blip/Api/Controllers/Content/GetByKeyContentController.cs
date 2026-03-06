using Blip.Models;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace Blip.Api.Controllers.Content;

[ApiVersion(1.0)]
public class GetByKeyContentController(
    IContentService contentService,
    IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    : BlipControllerBase(contentService, backOfficeSecurityAccessor)
{
    [HttpGet]
    [ProducesResponseType(typeof(ContentSlim), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(Guid key, string propertyAlias)
    {
        IContent? foundContent = ContentService.GetById(key);
        if (foundContent is null)
        {
            return NotFound();
        }

        IUser? currentUser = BackOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

        BlipContentDisplay content = MapToDisplay(foundContent);

        Guid? dataTypeKey = foundContent
            .Properties
            .FirstOrDefault(x => x.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase))?
            .PropertyType
            .DataTypeKey;

        if (dataTypeKey is null)
        {
            return NotFound();
        }

        ContentSlim slim = new()
        {
            Id = content.Id,
            Variants = content.Variants,
            DataTypeKey = dataTypeKey.Value,
            AllowedActions = content.AllowedActions,
        };

        // if the user has a start Id, and the node is outside any of those ids,
        // remove the browse permission
        if (currentUser?.StartContentIds?.Length > 0)
        {
            IEnumerable<int> pathIds = foundContent.Path.Split(',').Select(int.Parse);
            if (!pathIds.Intersect(currentUser.StartContentIds).Any())
            {
                slim.AllowedActions = content.AllowedActions?.Except(
                [
                    ActionBrowse.ActionLetter.ToString(),
                    ActionUpdate.ActionLetter.ToString(),
                ]);
            }
        }

        return Ok(slim);
    }
}
