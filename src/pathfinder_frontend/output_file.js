//寫寫而已，還沒有真的要執行
//import RNFS from 'react-native-fs';
//import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
//import { Platform } from 'react-native';

//在homepage建立空陣列，然後將選擇的object放到陣列中傳進此function，之後輸出相對應長度的section，內容順序為圖片、標題、內文
//之後得到這個文件的url，再用react native share套件分享
//const convertToWordAndShareHandler = (data) => {
/*const doc = new Document({
    //for(let i=0; i<selectedId.length; i++)
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun("Hello World"),
                    new TextRun({
                        text: "Foo Bar",
                        bold: true,
                    }),
                    new TextRun({
                        text: "\tGithub is the best",
                        bold: true,
                    }),
                ],
            }),
        ],
    }]
});*/

/*var path = (Platform.OS === 'ios'? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath) + '/text.docx';

RNFS.writeFile(path, 'hello world today is wednesday.', 'base64')
  .then((success) => {
    console.log('FILE WRITTEN!');
  })
  .catch((err) => {
    console.log(err.message);
  });

}*/
// Done! A file called 'My Document.docx' will be in your file system.

const convertToWordAndShareHandler = () => {
    console.log('convert to word');
}
export { convertToWordAndShareHandler };