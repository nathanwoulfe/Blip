import { IHttpService, IQService } from 'angular';

export class BlipContentResource {

    public static serviceName = 'blipContentResource';

    constructor(private $http: IHttpService, private $q: IQService, private umbRequestHelper, private umbDataFormatter) { }

    getScaffoldByKeys = (parentId, contentTypeKeys) =>

        this.umbRequestHelper.resourcePromise(
            this.$http.post(
                `${Umbraco.Sys.ServerVariables.Blip.contentApiBaseUrl}GetEmptyByKeys`,
                { contentTypeKeys, parentId }
            ),
            'Failed to retrieve data for empty content items ids' + contentTypeKeys.join(', '))
            .then(result => {
                Object.keys(result).map(key => {
                    result[key] = this.umbDataFormatter.formatContentGetData(result[key]);
                });

                return this.$q.when(result);
            });

    getById = id => 
        this.umbRequestHelper.resourcePromise(
            this.$http.get(`${Umbraco.Sys.ServerVariables.Blip.contentApiBaseUrl}GetById?id=` + id),
            'Failed to retrieve data for content item id' + id)
            .then(result => this.$q.when(result));
}
