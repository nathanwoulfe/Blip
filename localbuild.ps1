## clean up from previous runs
rm -r -force nupkgs
rm -r -force ./src/Blip.Backoffice/App_Plugins
mkdir nupkgs

## install backoffice dependencies
cd ./src/Blip.Backoffice
## npm install
npm run prod
cd ../../

## pack individually to avoid blip.site blowing up
dotnet pack ./src/Blip.Web/Blip.Web.csproj -c Release -o nupkgs
dotnet pack ./src/Blip.Backoffice/Blip.Backoffice.csproj -c Release -o nupkgs

## pack the container 
dotnet pack ./src/Blip/Blip.csproj -c Release -o nupkgs