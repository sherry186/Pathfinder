import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import { Searchbar, Button, Checkbox, Snackbar } from 'react-native-paper';
import { removeTemporaryGlobals } from '@apollo/client/utilities/globals';
import { total_major } from '../../table';
import { gql, useMutation } from '@apollo/client';

// for dev, user fixed id
const DEV = true;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

const UPDATEINTERESTEDDEP = gql`
mutation updateInterestedDepartment($userId: ID!, $department: [Int]!){
  updateInterestedDepartment(userId: $userId, department: $department) {
    id
    userId
    department
  }
}`;

export default function select_Dep({navigation, route}) {
  const [updateInterestedDepartment] = useMutation(UPDATEINTERESTEDDEP);
  const [query, setQuery] = useState("");
  const [selectDep, setSelectDep]= useState([]);
  const [seeSnackbar, setSeeSnackbar] = useState(false);
  const [searchDep, setSearchDep] = useState([]);
  var bottomlist_data=[];
  var index_array=[]; 


  for(let i=0;i<selectDep.length;i++){ //把selectDep的index挑出來
    index_array=index_array.concat(selectDep[i].index);
  }

  for(let j=0;j<total_major.length;j++){  //如果selectDep不包含此元素，則concat到bottomlist_data
    if(index_array.includes(total_major[j].index)==false){
      bottomlist_data = bottomlist_data.concat(total_major[j]);
    }
  }

  //console.log(bottomlist_data);

  const submitInterestedDepartments = () => {
    if(selectDep.length==0) {
      return;
    }
    let selectDep_ = selectDep.map( x => x.index)
    updateInterestedDepartment({ variables: { userId: (DEV? USERIDFORDEV : userId), department: selectDep_} });
    navigation.navigate("record_homepage")
  }

  const Item=({item}) => (
    <View style={styles.listitem}>
      <Text style={styles.listname}>{item.name}</Text>
      <Checkbox.Item status={'unchecked'} uncheckedColor="rgba(0,0,0,0.6)" style={{paddingRight:scale(16), borderRadius:4}}
        onPress={() => {
          if(selectDep.length<5) {setSelectDep(selectDep.concat(item));}
          else setSeeSnackbar(true);
        }}
      />
    </View>
  )

  const renderItem = ({ item }) => ( <Item item={item} /> );

  const handleSearch = (query) => {
    setQuery(query);     
    if(query=='') { return }
    else {
      const _bottomdata = bottomlist_data.filter(function(element){ 
      if (element.name.includes(query)) { return true; }
      else { return false; } });
      console.log('bo',_bottomdata);
      setSearchDep(_bottomdata);
    }    
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
            icon="chevron-left"
            style={styles.searchbar}
            placeholder="搜尋學類或學群"
            onChangeText={query => handleSearch(query)}
            value={query}
            onIconPress={()=>{navigation.navigate("record_homepage")}}
        />
      </View>
      {
        selectDep.length>0 &&
        <SafeAreaView style={styles.list_container}>
          <Text style={styles.first_title}>已選擇學類</Text>
          {
            selectDep.map((item)=>(
              <View style={styles.listitem}>
                <Text style={styles.listname}>{item.name}</Text>
                <Checkbox.Item status={'checked'} color="#EF6C00"
                          onPress={() => {
                            const _selectDep = selectDep.filter(function(element){ return element.index !== item.index });
                                  setSelectDep(_selectDep); }}
                          style={{paddingRight:scale(16), borderRadius:4}}/>
              </View>
            ))
          }
        </SafeAreaView>
      }
      <SafeAreaView style={{top:0,marginBottom:0,backgroundColor:'#fff',height:selectDep.length!=0?verticalScale(576-48*selectDep.length):verticalScale(616)}}>
        <Text style={styles.second_title}>更多學類</Text>
        <FlatList
          data={query==''?bottomlist_data:searchDep}
          renderItem={renderItem}
          keyExtractor={item => item.index.toString()}
        />
      </SafeAreaView>
      <View style={styles.bottom}>
        <Button mode="contained" color={selectDep.length==0? 'rgba(239, 108, 0, 0.6)':'#EF6C00'} 
                onPress={()=>submitInterestedDepartments()} style={styles.button} >
          <Text style={styles.text_in_button}>套用學類篩選 ({selectDep.length})</Text>
        </Button>
      </View>
      <Snackbar visible={seeSnackbar} onDismiss={()=>setSeeSnackbar(false)} style={styles.snackbar}>
        <Text style={{fontSize:moderateScale(16), color:'rgba(0,0,0,0.6)'}}>您已選滿五個學類</Text>
      </Snackbar>
      <StatusBar style="auto" translucent={false}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header:{
    width: scale(360),
    height: verticalScale(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  searchbar:{
    width: scale(350),
    height: verticalScale(48),
    backgroundColor: '#fff',
    borderRadius: 0,
    elevation: 0
  },
  bottom:{
    position: 'absolute', //到時候刪掉
    bottom:0,  //到時候刪掉
    width: scale(360),
    height: verticalScale(76),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    //zIndex:0
  },
  button:{
    width: scale(169),
    height: verticalScale(44),
    borderRadius:36,
    elevation:0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text_in_button:{
    fontSize: moderateScale(16),
    color:'#fff',
    //width: scale(129),
    //backgroundColor:'black'
  },
  list_container:{
    backgroundColor:'#fff',
    //height: verticalScale(616)
    flexDirection:'column',
    paddingBottom: verticalScale(4)
  },
  flatlist_container:{
    top:0,
    marginBottom:0,
    //height: verticalScale(700),
    backgroundColor:'#fff',
    //zIndex:2
  },
  listitem:{
    height: verticalScale(48),
    width: '100%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  listname:{
    //paddingTop: verticalScale(16),
    paddingLeft:scale(16),
    color:'rgba(0,0,0,0.87)',
    fontSize: moderateScale(16)
  },
  snackbar: { //position好奇怪qq
    position: 'absolute',
    top: verticalScale(-150),  
    left: scale(9),
    backgroundColor: '#fff',
    elevation: 8,
    borderRadius: 0,
    width: scale(328),
    height: verticalScale(48)
  },
  first_title:{
    paddingLeft:scale(16), 
    color:'#EF6C00', 
    fontSize:moderateScale(16), 
    paddingTop:verticalScale(16)
  },
  second_title:{
    paddingLeft:scale(16), 
    color:'#EF6C00', 
    fontSize:moderateScale(16), 
    paddingTop:verticalScale(16), 
    paddingBottom:verticalScale(8)
  },
});