import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import { IconButton, ProgressBar, Card, Button, Title, Dialog, Portal, Paragraph, Provider } from 'react-native-paper';

import department from '../../testData/department';

const Item = ({ title, image }) => (
  <Card  elevation={2} style={styles.cardContainer} onPress={()=> console.log("pressed card")}>
    <Card.Cover style={styles.cardCover} source={{ uri: image }} />
    <Card.Content style={styles.cardContent}>
      <Title style={styles.cardTitle}>{title}</Title>
    </Card.Content>
  </Card>
);

export default function dashboard_home() {
  const [visible, setVisible] = useState(false);

  const showDialog = () => {console.log('true visible: ', visible); setVisible(true);}
  const hideDialog = () => {console.log('false visible: ', visible); setVisible(false);}

  const renderItem = ({ item }) => (
    <Item title={item.title} image={item.image} />
  );

  return (
    <View style={styles.container}>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>能力分析方式</Dialog.Title>
          <Dialog.Content>
            <Paragraph>待補...</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} color="#EF6C00">了解</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={styles.headerContainer1}>
        <View style={styles.headerAndIconContainer}>
          <Text style={styles.header}>能力分析</Text>
          <IconButton
                  icon="information-outline"
                  style={styles.information_outline_icon}
                  size={moderateScale(20)}
                  color={'rgba(0, 0, 0, 0.6)'}
                  onPress={showDialog}
          /> 
        </View>
        <View style={styles.abilityBarsContainer}>
          <View style={styles.abilityBarContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>組織能力</Text>
              <Text style={styles.subtitle2}>30%</Text>
            </View>
            <ProgressBar progress={0.3} color={'#EF6C00'} style={styles.progressBar} />
          </View>
          <View style={styles.abilityBarContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>組織能力</Text>
              <Text style={styles.subtitle2}>30%</Text>
            </View>
            <ProgressBar progress={0.3} color={'#EF6C00'} style={styles.progressBar} />
          </View>
          <View style={styles.abilityBarContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>組織能力</Text>
              <Text style={styles.subtitle2}>30%</Text>
            </View>
            <ProgressBar progress={0.3} color={'#EF6C00'} style={styles.progressBar} />
          </View>
          <View style={styles.abilityBarContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>組織能力</Text>
              <Text style={styles.subtitle2}>30%</Text>
            </View>
            <ProgressBar progress={0.3} color={'#EF6C00'} style={styles.progressBar} />
          </View>
          <View style={styles.abilityBarContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>組織能力</Text>
              <Text style={styles.subtitle2}>30%</Text>
            </View>
            <ProgressBar progress={0.3} color={'#EF6C00'} style={styles.progressBar} />
          </View>
          <Button 
            mode="outlined" 
            color="rgba(0, 0, 0, 0.87)"
            icon="chevron-right"
            contentStyle={{flexDirection: 'row-reverse'}}
            onPress={() => console.log('Pressed')}>
              其他能力
          </Button>
        </View>
        
      </View>
      <View style={styles.headerContainer2}>
        <Text style={styles.header}>推薦學類</Text>

        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.cardListContainer}
          data={department}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        >
        </FlatList>
      </View>
      <StatusBar style="auto" />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer1:{
    position: 'absolute',
    left: scale(16),
    right: scale(16),
    top: verticalScale(40),
  },
  headerContainer2:{
    position: 'absolute',
    left: scale(16),
    //marginTop: verticalScale(28),
    top: verticalScale(428),
  },
  headerAndIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontWeight: "500",
    fontSize: moderateScale(24),
    lineHeight: moderateScale(32),
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: moderateScale(0.15)
  },
  abilityBarsContainer: {
    marginVertical: verticalScale(16),
    /*shadow start*/
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    backgroundColor: '#fff',
    /* shadow end*/
    borderRadius: scale(16),
    padding: scale(16),
    paddingTop:scale(16),
    height: verticalScale(312),
    justifyContent: 'space-around',
  },
  abilityBarContainer: {
    flexDirection: "column",
    //backgroundColor: 'red',
    //alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: scale(2),
    paddingBottom: scale(12)
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontWeight: "500",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: moderateScale(0.15)
  },
  subtitle2: {
    fontWeight: "500",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
    color: '#EF6C00',
    letterSpacing: moderateScale(0.15)
  },
  progressBar: {
    position: 'absolute',
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: scale(15),
    top: verticalScale(8)
  },
  information_outline_icon:{
    position: 'absolute',
    right: scale(2)
  },
  departmentItemContainer:{
    marginTop: verticalScale(16),
    //backgroundColor: 'red',
    height: verticalScale(138),
    width: moderateScale(242),
    borderRadius: scale(8),
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardListContainer: {
    padding: scale(4)
  },
  cardContainer: {
    marginTop: verticalScale(16),
    width: moderateScale(242, 0),
    marginRight: moderateScale(8)
  },
  cardCover: {
    height: verticalScale(95)
  },
  cardContent: {
    height: verticalScale(43),
    
  },
  cardTitle: {
    fontWeight: "500",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: moderateScale(0.15),
  }
});