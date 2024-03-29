package com.writenow;

import com.facebook.react.ReactActivity;

import com.rssignaturecapture.RSSignatureCapturePackage;
import com.github.xfumihiro.react_native_image_to_base64.ImageToBase64Package;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.imagepicker.ImagePickerPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration; 

public class MainActivity extends ReactActivity {

    //added by sagi uziel 1.10.16 -start

    //added by sagi uziel 1.10.16 -end
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

    @Override
    protected String getMainComponentName() {
        //Context.getApplicationContext();
        return "WriteNow";        
    }

    @Override
      public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}