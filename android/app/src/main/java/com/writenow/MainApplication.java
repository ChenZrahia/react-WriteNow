package com.writenow;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import com.imagepicker.ImagePickerPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import org.pgsqlite.SQLitePluginPackage; //added by sagi uziel 1.10.16
import com.imagepicker.ImagePickerPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;

public class MainApplication extends Application implements ReactApplication {

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

            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new ReactNativeContacts()

      );
    }
  };

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
