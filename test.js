const regedit = require('regedit');
const fs = require("fs");
const path = require("path");
const os = require("os");

const test = () => {
    // const UUID = '5f7ad500-216c-415d-aa2b-300d652aa3f9';
    // const SOFTWARE_CLASS_64_CLSID = `HKCU\\Software\\Classes\\Wow6432Node\\CLSID\\{${UUID}}`;

    // const INSTANCE_64 = `${SOFTWARE_CLASS_64_CLSID}\\Instance`;

    // const INIT_PROPERTY_BAG_64 = `${INSTANCE_64}\\InitPropertyBag`;

    // regedit.createKey(['', INIT_PROPERTY_BAG_64], (e) => {
    //     if (e) console.error("[==== ERROR ====]", e);
    // });

    console.log( path.join(os.homedir(), "FStorage") );
    fs.mkdirSync(path.join(os.homedir(), "FStorage"));
}


test();

