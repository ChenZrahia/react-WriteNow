package com.writenow;
import android.app.Application;
import android.util.Log;
import com.facebook.react.ReactApplication;
import java.lang.Thread;
import android.widget.Toast;
import android.app.Fragment;
import android.content.Context;
//import com.bitgo.randombytes.RandomBytesPackage;
// import fnd.reactaes.reactaes.ReactAESPackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
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
import java.util.Arrays;
import java.util.List;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import org.pgsqlite.SQLitePluginPackage; 
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import android.content.Intent;
// import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage; 
import com.rssignaturecapture.RSSignatureCapturePackage; 
// import com.github.yamill.orientation.OrientationPackage;
import com.reactnative.photoview.PhotoViewPackage;

public class MainApplication extends Application implements ReactApplication {
//private ReactNativePushNotificationPackage mReactNativePushNotificationPackage; // <------ Add Package Variable
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new SQLitePluginPackage(),
          new MainReactPackage(),
          // new OrientationPackage(),
            new InCallManagerPackage(),
            new RNSoundPackage(),
            new WebRTCModulePackage(),
            new FIRMessagingPackage(),
            new ImageToBase64Package(),
            new ImageResizerPackage(),
            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new ReactNativeContacts(),
            new RSSignatureCapturePackage(),
            new PhotoViewPackage()
      );
    }
  };
            //new BlurViewPackage(),
           
  
        //    new RNOpenPGPPackage(),
  
            //new EncryptionUtilPackage()
            // new ReactNativePushNotificationPackage(),
            //


    @Override
    public void onCreate() {
      try{
        super.onCreate();
        // Setup handler for uncaught exceptions.
        Thread.setDefaultUncaughtExceptionHandler (new Thread.UncaughtExceptionHandler()
        {
          @Override
          public void uncaughtException (Thread thread, Throwable e)
          {
            try{
              Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show();
            }catch (Exception ex) {
              ex.printStackTrace();
            }
          }
        });

        // FORCE LTR
        I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
        sharedI18nUtilInstance.allowRTL(getApplicationContext(), false);
        }catch (Exception e) {
          try{
            Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show();
          }catch (Exception ex) {
            ex.printStackTrace();
          }
        e.printStackTrace();
      }
    }

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