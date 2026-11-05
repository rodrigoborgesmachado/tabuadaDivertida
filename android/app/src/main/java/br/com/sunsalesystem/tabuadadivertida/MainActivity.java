package br.com.sunsalesystem.tabuadadivertida;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(IconeAppPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
