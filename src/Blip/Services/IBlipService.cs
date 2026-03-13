using Blip.Models;
using Umbraco.Cms.Core;

namespace Blip.Services;

public interface IBlipService
{
    Task<Attempt<ContentSlim?, BlipOperationStatus>> GetContentByKey(Guid key, string propertyAlias, string? culture = null);
}
