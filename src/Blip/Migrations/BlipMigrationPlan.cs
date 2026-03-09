using Umbraco.Cms.Core.Packaging;

namespace Blip.Migrations;

internal class BlipMigrationPlan : PackageMigrationPlan
{
    public BlipMigrationPlan()
        : base(Constants.PackageId, Constants.PackageName, Constants.PackageId)
    {
    }

    protected override void DefinePlan() =>
        From(InitialState)
        .To<UdiToGuidValueStore>("{a8e84743-e4bd-42e3-87e0-e8ee0a1af0b7}");
}
