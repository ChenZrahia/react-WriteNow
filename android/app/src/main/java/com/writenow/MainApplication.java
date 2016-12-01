package com.writenow;
import android.app.Application;
import android.util.Log;
import com.facebook.react.ReactApplication;
// import com.cmcewen.blurview.BlurViewPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
// import com.github.orhan.openpgp.RNOpenPGPPackage;
import com.github.xfumihiro.react_native_image_to_base64.ImageToBase64Package;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.rssignaturecapture.RSSignatureCapturePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
//import com.encryptionutil.EncryptionUtilPackage;

import java.util.Arrays;
import java.util.List;

import org.pgsqlite.SQLitePluginPackage; //added by sagi uziel 1.10.16
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import android.content.Intent;
// import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage; 
import com.rssignaturecapture.RSSignatureCapturePackage; 

public class MainApplication extends Application implements ReactApplication {
//private ReactNativePushNotificationPackage mReactNativePushNotificationPackage; // <------ Add Package Variable
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new SQLitePluginPackage(),
          new MainReactPackage(),
            new FIRMessagingPackage(),
            new ImageToBase64Package(),
            new ImageResizerPackage(),
            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new ReactNativeContacts(),
            new RSSignatureCapturePackage()
      );
    }
  };
            //new BlurViewPackage(),
  
        //    new RNOpenPGPPackage(),
  
            //new EncryptionUtilPackage()
            // new ReactNativePushNotificationPackage(),
            //

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
//added by sagi uziel 1.10.16 (new SQLitePluginPackage)

  // @Override //added by sagi uziel 1.10.16
  //   protected List<ReactPackage> getPackages() {
  //     return Arrays.<ReactPackage>asList(
  //       new SQLitePluginPackage(),   // register SQLite Plugin here
  //       new MainReactPackage());
  //   }
}


