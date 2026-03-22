const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!--
        base-config trusts both system CAs and the bundled self-signed VM cert.
        domain-config does not support IP addresses in Android, so the VM cert
        must be trusted globally. cleartextTrafficPermitted=true allows Metro (local dev).
    -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="@raw/vm_cert"/>
        </trust-anchors>
    </base-config>
</network-security-config>`;

// Step 1: write network_security_config.xml and copy vm_cert.pem into res/
const withNetworkSecurityFiles = (config) => {
    return withDangerousMod(config, [
        'android',
        (config) => {
            const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res');

            // Write network_security_config.xml
            const xmlDir = path.join(resDir, 'xml');
            fs.mkdirSync(xmlDir, { recursive: true });
            fs.writeFileSync(path.join(xmlDir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG);

            // Copy vm_cert.pem from project plugins/ dir into res/raw/
            const rawDir = path.join(resDir, 'raw');
            fs.mkdirSync(rawDir, { recursive: true });
            const certSrc = path.join(__dirname, 'vm_cert.pem');
            const certDst = path.join(rawDir, 'vm_cert.pem');
            if (fs.existsSync(certSrc)) {
                fs.copyFileSync(certSrc, certDst);
            } else {
                console.warn('[withNetworkSecurity] vm_cert.pem not found in plugins/ directory');
            }

            return config;
        },
    ]);
};

// Step 2: add android:networkSecurityConfig to AndroidManifest.xml
const withNetworkSecurityManifest = (config) => {
    return withAndroidManifest(config, (config) => {
        const app = config.modResults.manifest.application[0];
        app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
        return config;
    });
};

module.exports = (config) => {
    config = withNetworkSecurityFiles(config);
    config = withNetworkSecurityManifest(config);
    return config;
};
