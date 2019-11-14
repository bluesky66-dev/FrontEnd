# Running the application

To run the application against your localhost API:

```
npm install
npm run serve:dev
```

To run the application against the staging API:

```
npm install
npm run serve:stage
```

To run the application against the production API:

```
npm run serve:prod
```

# Release an IOS version

You need to get all the certificates. Ask a developer on your team for that.

```
npm install -g ios-sim
npm install -g ios-deploy
ionic platform rm ios
ionic platform add ios
gem install cocoapods
npm run build:dev
npm run build:stage
npm run build:prod

```

Make sure cocoapods has everything installed properly.

```
cd platforms/ios
pod install
```

Make sure you bumped the version in the config.xml file.

Now we need to do some changes to the project.  Open the `.xcworkspace` project.

Find some assets that are needed:
![Find the assets](https://www.dropbox.com/s/85c6odj1hy8if26/Screenshot%202017-02-01%2016.19.14.png?dl=1)

Drag images into xcode:
![Drag images into xcode](https://www.dropbox.com/s/w8qquic2n3cmqzn/Screenshot%202017-02-01%2016.19.45.png?dl=1)

Enable push:
![Enable push](https://www.dropbox.com/s/ndqfocg03ekxxwc/Screenshot%202017-02-01%2016.20.33.png?dl=1)

Under info enable:

```
App uses non excempt encryption: false

Localizations: German first, then English.
```

Now Build->Archive. Then you will have a screen where you can upload the app. Validate it first.
![Archive it](https://www.dropbox.com/s/1x3jep53k4o66ng/Screenshot%202017-02-01%2016.23.58.png?dl=1)

Done. Deploy the version.


# Building for Android

```
ionic platform rm android
ionic platform add android
npm run build:dev
npm run build:stage
npm run build:prod

```

1. Open Android Studio
2. Locate the Android project from the `platforms/android` folder
3. Building takes a while, check the status bar.
4. Build->Generate Signed APK

![example](https://www.dropbox.com/s/t88osijwqrpysfj/Screenshot%202017-02-01%2016.29.45.png?dl=1)

5. Select the keystore from the project. Settings should have been sent to you
   by another dev.

![example](https://www.dropbox.com/s/m5w7yw9w51cik8p/Screenshot%202017-02-01%2016.30.25.png?dl=1)

6. In the platforms folder you will find an apk file. Upload that one on the
   google play store.

# Testing registration

If you are running against your local backend, you can just use any of the
test credit cards from: https://stripe.com/docs/testing#cards. If you are
running against production, you have to use a real credit card for testing.
