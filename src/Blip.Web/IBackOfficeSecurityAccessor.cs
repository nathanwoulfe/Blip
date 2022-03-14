#if NETFRAMEWORK
using Umbraco.Core;
using Umbraco.Core.Models.Membership;
using Umbraco.Web.Composing;

namespace Blip.Web
{
    public interface IBackOfficeSecurityAccessor
    {
        IBackOfficeSecurity BackOfficeSecurity { get;  }
    }

    public class BackOfficeSecurityAccessor : IBackOfficeSecurityAccessor
    {
        public IBackOfficeSecurity BackOfficeSecurity => new BackOfficeSecurity();
    }

    public interface IBackOfficeSecurity
    {
        IUser CurrentUser { get; }
        Attempt<int> GetUserId();
    }

    public class BackOfficeSecurity : IBackOfficeSecurity
    {
        // TODO => Is this the best place to get the current user?
        public IUser CurrentUser => Current.UmbracoContext?.Security?.CurrentUser;

        public Attempt<int> GetUserId() => CurrentUser == null ? Attempt.Fail<int>() : Attempt.Succeed(CurrentUser.Id);        
    }
}
#endif