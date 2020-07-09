# ManifestMy Server Code

## Install

0. Get the ServiceAccountMySpace.json file and ServiceAccountMyLife.json from the Google Drive. Copy the right key to overwrite ServiceAccountKey.json
1. Make changes to the .runtimeconfig according to the function type(MySpace or MyLife DB)
2. `npm install`
3. `npm run build`
4. compress everything except the /node_modules in the root directory to .zip file.
5. Upload the zip file to google cloud platform - function for testing.
