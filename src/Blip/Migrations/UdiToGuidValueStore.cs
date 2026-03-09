using System.Text.Json;
using NPoco;
using Umbraco.Cms.Core;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Blip.Migrations;

internal class UdiToGuidValueStore : AsyncMigrationBase
{
    public UdiToGuidValueStore(IMigrationContext context)
        : base(context)
    {
    }

    /// <summary>
    /// Old versions of Blip stored block list item keys as Udis, this migration will convert those to Guids,
    /// which reduces mapping and parsing on the client and in the PVC
    /// </summary>
    /// <returns></returns>
    protected override async Task MigrateAsync()
    {
        _ = Database.Execute(@"
            UPDATE [umbracoDataType]
            SET propertyEditorUiAlias = 'Blip.PropertyEditorUi.BlockListItemPicker'
            WHERE propertyEditorAlias = @0 AND propertyEditorUiAlias IS NULL", [Constants.PackageId]);

        //List<PropertyDataDto> propertyData = Database.Fetch<PropertyDataDto>(@"
        //    SELECT * FROM [umbracoPropertyData] pd
        //    JOIN [cmsPropertyType] pt
        //    ON pt.id = pd.propertytypeId
        //    JOIN [umbracoDataType] dt
        //    ON dt.nodeId = pt.dataTypeId
        //    WHERE dt.propertyEditorAlias = @0", [Constants.PackageId]);

        //if (propertyData.Count == 0)
        //{
        //    return;
        //}

        //foreach (PropertyDataDto propertyDataDto in propertyData)
        //{
        //    List<string>? value = JsonSerializer.Deserialize<List<string>>(propertyDataDto.TextValue);
        //    if (value is null || value.Count == 0)
        //    {
        //        continue;
        //    }

        //    IEnumerable<string> newValue = value.SelectMany<string, string>(x =>
        //        UdiParser.TryParse(x, out Udi? udi) && udi is GuidUdi guidUdi
        //            ? [guidUdi.Guid.ToString()]
        //            : []);

        //    propertyDataDto.TextValue = JsonSerializer.Serialize(newValue);
        //    _ = Database.Update(propertyDataDto);
        //}
    }

    //[TableName(TableName)]
    //[PrimaryKey(PrimaryKeyColumnName)]
    //[ExplicitColumns]
    //private class PropertyDataDto
    //{
    //    public const string TableName = Umbraco.Cms.Core.Constants.DatabaseSchema.Tables.PropertyData;
    //    public const string PrimaryKeyColumnName = Umbraco.Cms.Core.Constants.DatabaseSchema.Columns.PrimaryKeyNameId;

    //    [PrimaryKeyColumn]
    //    [Column(PrimaryKeyColumnName)]
    //    public int Id { get; set; }

    //    [Column("textValue")]
    //    public string TextValue { get; set; } = string.Empty;
    //}
}
