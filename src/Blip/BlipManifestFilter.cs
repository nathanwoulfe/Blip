using Umbraco.Cms.Core.Manifest;

namespace Blip;

/// <summary>
/// Adds the backoffice files.
/// </summary>
internal sealed class BlipManifestFilter : IManifestFilter
{
    /// <inheritdoc/>
    public void Filter(List<PackageManifest> manifests) => manifests.Add(new PackageManifest
    {
        PackageName = "Blip",
        Scripts = new[]
        {
            "/App_Plugins/Blip/Backoffice/blip.min.js",
        },
        Stylesheets = new[]
        {
            "/App_Plugins/Blip/Backoffice/blip.min.css",
        },
        BundleOptions = BundleOptions.None,
    });
}
