import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AssetsSelector } from 'expo-images-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { verticalScale } from '../../scaling_utils';

import { gql, useMutation, useQuery } from '@apollo/client';

const ADDIMAGES = gql`
mutation addImages($recordId: ID!, $images:[String]!){
  addImages(recordId: $recordId, images: $images)
} `;

const ForceInset = {
  top: 'never',
  bottom: 'never',
};

export default function pick_images({navigation, route}) {
  var images = [];
  //const [images, setImages] = useState([]);
  const [addImages] = useMutation(ADDIMAGES);

  const widgetErrors = useMemo(
    () => ({
      errorTextColor: 'black',
      errorMessages: {
        hasErrorWithPermissions: 'Please Allow media gallery permissions.',
        hasErrorWithLoading: 'There was error while loading images.',
        hasErrorWithResizing: 'There was error while loading images.',
        hasNoAssets: 'No images found.',
      },
    }),
    []
  );

  const widgetSettings = useMemo(
    () => ({
      getImageMetaData: false, // true might perform slower results
      initialLoad: 100,
      //assetsType: MediaType.photo,
      minSelection: 1,
      maxSelection: 5,
      portraitCols: 4,
      landscapeCols: 4,
    }),
    []
  );

  const uploadImage = async (image, index, length) => {

    let picture = await fetch(image.uri);
    picture = await picture.blob();

    let uri = image.uri;
    let uriParts = uri.split('.');
    let fileType_ = uriParts[uriParts.length - 1];
    let imageExt =  fileType_.split('?')[0].toLowerCase();
    const imageMime = `image/${imageExt}`;
    const imageData = new File([picture], `photo.${imageExt}`);

    //get secure url from Server
    const { url } = await fetch("https://desolate-refuge-17724.herokuapp.com/s3Url").then(res => res.json());
    console.log(url);

    // post image to s3
    await fetch(url, {
      method: 'PUT',
      body: imageData,
      headers: {
        'Content-Type': imageMime,
      },
    })

    const imageUrl = url.split('?')[0];
    console.log(imageUrl);

    images.push(imageUrl);

    console.log(images);
    if(index == length - 1) {
      addImages({ variables: { recordId: route.params.id, images: images } })
    }
    

    //console.log(images);
  }


  const widgetNavigator = useMemo(
    () => ({
      Texts: {
        finish: '完成',
        back: '返回',
        selected: '選擇',
      },
      midTextColor: 'black',
      minSelection: 1,
      buttonTextStyle: {color:'#EF6C00'},
      buttonStyle: {backgroundColor:'#fff', borderRadius:5},
      onBack: () => {navigation.navigate("addOrUpdate", 
                    {title:route.params.title,description:route.params.description,createdAt:route.params.createdAt,updatedAt:route.params.updatedAt,id:route.params.id,image:[]});},
      //onBack: () => {navigation.goBack()},
      onSuccess: async (data)=> {

        console.log('data',data);
        
        for(let i = 0; i < data.length; i++) {
          uploadImage(data[i], i, data.length);
        }

        var imageData = [];
        for(let i = 0; i < data.length; i++) {
          imageData.push(data[i].uri);
        }

        navigation.navigate("addOrUpdate", {
          title:route.params.title,
          description:route.params.description,
          createdAt:route.params.createdAt,
          updatedAt:route.params.updatedAt,
          id:route.params.id,
          image:imageData
        });
      },
    }),
    []
  );

  const widgetStyles = useMemo(
    () => ({
      margin: 3,
      bgColor: '#fff',
      spinnerColor: '#EF6C00',
      widgetWidth: 99,
      videoIcon: {
        Component: Ionicons,
        iconName: 'ios-videocam',
        color: '#EF6C00',
        size: 20,
      },
      selectedIcon: {
        Component: Ionicons,
        iconName: 'ios-checkmark-circle-outline',
        color: 'white',
        bg: 'rgba(239, 108, 0, 0.5)',
        size: 26,
      },
    }),
    []
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView forceInset={ForceInset} style={styles.container}>
        <View style={styles.view_container}>
          <AssetsSelector
            Settings={widgetSettings}
            Errors={widgetErrors}
            Styles={widgetStyles}
            Navigator={widgetNavigator}
            // Resize={widgetResize} know how to use first , perform slower results.
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fff'
  },
  view_container:{
    height: verticalScale(716),
    top: verticalScale(40),
    backgroundColor: '#fff'
  }
});
