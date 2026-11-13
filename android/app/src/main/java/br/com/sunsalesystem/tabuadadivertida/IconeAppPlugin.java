package br.com.sunsalesystem.tabuadadivertida;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Base64;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "IconeApp")
public class IconeAppPlugin extends Plugin {

    private static final String ICONE_PADRAO = "cor-prata";
    private static final List<String> ICONES = Arrays.asList(
        "cor-prata", "cor-azul", "cor-vermelho", "cor-verde", "cor-laranja",
        "cor-roxa", "cor-dourada", "cor-verde-neon", "cor-rosa-neon", "cor-azul-eletrico",
        "cor-rubi", "cor-esmeralda", "cor-safira", "cor-arco-iris", "cor-holografico",
        "cor-por-do-sol", "cor-aurora", "cor-cristal", "cor-fogo-gelo", "cor-ouro",
        "cor-cometa", "cor-nebulosa", "cor-supernova", "cor-buraco-negro", "cor-infinito"
    );
    private static final String ATALHO = "meu-robo";
    private static final String EXTRA_ATALHO = "atalho-robo";

    private ComponentName componente(String icone) {
        return new ComponentName(getContext(), getContext().getPackageName() + ".icone_" + icone.replace("cor-", "").replace('-', '_'));
    }

    private boolean ativo(String icone) {
        int estado = getContext().getPackageManager().getComponentEnabledSetting(componente(icone));
        return estado == PackageManager.COMPONENT_ENABLED_STATE_ENABLED || (estado == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && ICONE_PADRAO.equals(icone));
    }

    private boolean atalhoCriado() {
        for (ShortcutInfoCompat atalho : ShortcutManagerCompat.getShortcuts(getContext(), ShortcutManagerCompat.FLAG_MATCH_PINNED)) {
            if (ATALHO.equals(atalho.getId())) {
                return true;
            }
        }
        return false;
    }

    @PluginMethod
    public void iconeAtual(PluginCall call) {
        String atual = ICONE_PADRAO;
        for (String icone : ICONES) {
            if (ativo(icone)) {
                atual = icone;
                break;
            }
        }

        JSObject resultado = new JSObject();
        resultado.put("icone", atual);
        resultado.put("suportado", Build.VERSION.SDK_INT >= Build.VERSION_CODES.O);
        call.resolve(resultado);
    }

    @PluginMethod
    public void trocarIcone(PluginCall call) {
        String icone = call.getString("icone", "");
        if (!ICONES.contains(icone)) {
            call.reject("Ícone inválido");
            return;
        }

        PackageManager gerenciador = getContext().getPackageManager();
        gerenciador.setComponentEnabledSetting(componente(icone), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
        for (String outro : ICONES) {
            if (!outro.equals(icone)) {
                gerenciador.setComponentEnabledSetting(componente(outro), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void atalho(PluginCall call) {
        JSObject resultado = new JSObject();
        resultado.put("suportado", ShortcutManagerCompat.isRequestPinShortcutSupported(getContext()));
        resultado.put("criado", atalhoCriado());
        call.resolve(resultado);
    }

    @PluginMethod
    public void criarAtalho(PluginCall call) {
        byte[] bytes = Base64.decode(call.getString("imagem", ""), Base64.DEFAULT);
        Bitmap imagem = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (imagem == null) {
            call.reject("Imagem inválida");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_MAIN).setClass(getContext(), MainActivity.class).putExtra(EXTRA_ATALHO, true);
        ShortcutInfoCompat atalho = new ShortcutInfoCompat.Builder(getContext(), ATALHO)
            .setShortLabel("Meu robô")
            .setIcon(IconCompat.createWithAdaptiveBitmap(imagem))
            .setIntent(intent)
            .build();
        boolean atualizado = atalhoCriado();
        boolean sucesso = atualizado
            ? ShortcutManagerCompat.updateShortcuts(getContext(), Collections.singletonList(atalho))
            : ShortcutManagerCompat.requestPinShortcut(getContext(), atalho, null);

        JSObject resultado = new JSObject();
        resultado.put("sucesso", sucesso);
        resultado.put("atualizado", atualizado);
        call.resolve(resultado);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent.getBooleanExtra(EXTRA_ATALHO, false)) {
            notifyListeners("atalhoAberto", new JSObject());
        }
    }
}
