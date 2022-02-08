const User = require("../../models/user"); //the user models
const Record = require("../../models/record"); //the record models
const Tag = require("../../models/tag"); //the tag models
const Activity = require("../../models/activity"); //the activity models
const InterestedDepartment = require("../../models/interestedDepartment"); //the interestedDepartment models
const generate = require("shortid");
const bcrypt = require("bcrypt");
const moment = require("moment");
var fs = require('fs');
const major_to_index = require("../../table/totalData.js");
const index_to_major = require("../../table/totalDataForOpposite.js");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const {computeAbilities} = require("../../compute_score/computeScore.js");

module.exports = {
    printHello: () => {
        return 'Hello pathfinder!';
    },

    getUser: async ( args ) => {
        const userId = args.userId;
        let user = await User.findOne({ _id: userId });
        return user;
    },

    getInterestedDepartments:  async ( args ) => {
        const userId = args.userId;
        let InterestedDepartments = await InterestedDepartment.findOne({ userId: userId });
        return InterestedDepartments.department;
    },
    
    getRecords: async ( args ) => {
        const userId = args.userId;
        let records = await Record.find({ userId: userId });
        return records;
    },

    getUserTags: async ( args ) => {
        const userId = args.userId;
        let userTags = await Tag.findOne({ userId: userId });
        return userTags.tags;
    },

    getRecordTags: async ( args ) => {
        const recordId = args.recordId;
        let recordTags = await Record.findOne({ _id: recordId });
        return recordTags.tags;
    },

    getActivities: async ( args ) => {

        //************************************ 推薦演算法：興趣學類部分 **********************************//
        /* 推薦演算法：興趣學類部分（把使用者輸入的major轉成department再根據資料庫相符的department推薦） */
        const userId = args.userId;
        let userDepart = await InterestedDepartment.findOne({ userId: userId });
        let major = userDepart.department; //該userId下的interested department(後來改成major)

        /* major -> department */
        var depart = [];
        var departCnt = 0;
        var map;
        for(var i = 0; i < major.length; i++){ //將interested major map成 department
            /* hardcode mapping */
            if( 1 <= major[i] && major[i] <= 2 ) map = 1; 
            else if( 3 <= major[i] && major[i] <= 15 ) map = 2;
            else if( 16 <= major[i] && major[i] <= 20 ) map = 3;
            else if( 21 <= major[i] && major[i] <= 37 ) map = 4;
            else if( 38 <= major[i] && major[i] <= 41 ) map = 5;
            else if( 42 <= major[i] && major[i] <= 50) map = 6;
            else if( 51 <= major[i] && major[i] <= 56 ) map = 7;
            else if( 57 <= major[i] && major[i] <= 65 ) map = 8;
            else if( 66 <= major[i] && major[i] <= 68 ) map = 9;
            else if( 69 <= major[i] && major[i] <= 76 ) map = 10;
            else if( 77 <= major[i] && major[i] <= 81 ) map = 11;
            else if( 82 <= major[i] && major[i] <= 86 ) map = 12;
            else if( 87 <= major[i] && major[i] <= 94 ) map = 13;
            else if( 95 <= major[i] && major[i] <= 100 ) map = 14;
            else if( 101 <= major[i] && major[i] <= 104 ) map = 15;
            else if( 105 <= major[i] && major[i] <= 117 ) map = 16;
            else if( 118 <= major[i] && major[i] <= 124 ) map = 17;
            else if( 125 <= major[i] && major[i] <= 126 ) map = 18;
            else map = 19;

            /* 檢查該department 是否已存在*/
            var exist = false;
            for(var j = 0; j < depart.length; j++){
                if(map == depart[j]){
                    exist = true;
                    break;
                }
            }
            if(exist == false){
                depart[departCnt] = map;
                departCnt++;
            }
        }

        /* 推薦部分 */
        var activities = [];
        var count = 0;

        for(var i = 0; i < depart.length; i++){   //找在資料庫中有包含此interested department[i]的
            let activ = await Activity.find({      
                department: { $in: [ depart[i] ] }  
            });
            
            for(var j = 0; j < activ.length; j++){ //有包含interested department[i]的所有活動
                let id = activ[j].id;
                if(count == 0){ //跑第一次不需檢查活動是否重複
                    activities[count] = activ[j];
                    count++;
                }
                else{
                    var flag = true;
                    for(var k = 0; k < count; k++){ 
                        if(id == activities[k].id) {
                            flag = false; //若重複則不加入
                            break;
                        }
                    }
                    if(flag == true){
                        activities[count] = activ[j];
                        count++;
                    }
                }   
            }
            
        }


        //************************************ 推薦演算法：推薦學類部分 **********************************//
        /* 推薦演算法：推薦學類部分（依據使用者topDepartment, 轉成department後, 去資料庫找具有該學群tag的活動推薦） */
        let user = await User.findOne({ _id: userId });
        let topDepartment = user.topDepartment;
        var topDepartNum = [];
        for(var i = 0; i < topDepartment.length; i++){
            var str = topDepartment[i].split(" ")[0];
            topDepartNum[i] = major_to_index[str];
        }

        /* major -> department */
        depart = []; departCnt = 0;
        for(var i = 0; i < topDepartNum.length; i++){ //將topMajor map成 department
            /* hardcode mapping */
            if( 1 <= topDepartNum[i] && topDepartNum[i] <= 2 ) map = 1; 
            else if( 3 <= topDepartNum[i] && topDepartNum[i] <= 15 ) map = 2;
            else if( 16 <= topDepartNum[i] && topDepartNum[i] <= 20 ) map = 3;
            else if( 21 <= topDepartNum[i] && topDepartNum[i] <= 37 ) map = 4;
            else if( 38 <= topDepartNum[i] && topDepartNum[i] <= 41 ) map = 5;
            else if( 42 <= topDepartNum[i] && topDepartNum[i] <= 50) map = 6;
            else if( 51 <= topDepartNum[i] && topDepartNum[i] <= 56 ) map = 7;
            else if( 57 <= topDepartNum[i] && topDepartNum[i] <= 65 ) map = 8;
            else if( 66 <= topDepartNum[i] && topDepartNum[i] <= 68 ) map = 9;
            else if( 69 <= topDepartNum[i] && topDepartNum[i] <= 76 ) map = 10;
            else if( 77 <= topDepartNum[i] && topDepartNum[i] <= 81 ) map = 11;
            else if( 82 <= topDepartNum[i] && topDepartNum[i] <= 86 ) map = 12;
            else if( 87 <= topDepartNum[i] && topDepartNum[i] <= 94 ) map = 13;
            else if( 95 <= topDepartNum[i] && topDepartNum[i] <= 100 ) map = 14;
            else if( 101 <= topDepartNum[i] && topDepartNum[i] <= 104 ) map = 15;
            else if( 105 <= topDepartNum[i] && topDepartNum[i] <= 117 ) map = 16;
            else if( 118 <= topDepartNum[i] && topDepartNum[i] <= 124 ) map = 17;
            else if( 125 <= topDepartNum[i] && topDepartNum[i] <= 126 ) map = 18;
            else map = 19;

            /* 檢查該department 是否已存在*/
            var exist = false;
            for(var j = 0; j < depart.length; j++){
                if(map == depart[j]){
                    exist = true;
                    break;
                }
            }
            if(exist == false){
                depart[departCnt] = map;
                departCnt++;
            }
        }

        /* 推薦部分 */
        for(var i = 0; i < depart.length; i++){   //找在資料庫中有包含此top department[i]的
            let activ = await Activity.find({      
                department: { $in: [ depart[i] ] }  
            });

            for(var j = 0; j < activ.length; j++){ //有包含top department[i]的所有活動
                let id = activ[j].id;
                if(count == 0){ //跑第一次不需檢查活動是否重複
                    activities[count] = activ[j];
                    count++;
                }
                else{
                    var flag = true;
                    for(var k = 0; k < count; k++){ 
                        if(id == activities[k].id) {
                            flag = false; //若重複則不加入
                            break;
                        }
                    }
                    if(flag == true){
                        activities[count] = activ[j];
                        count++;
                    }
                }   
            }

        }

        //************************************ 推薦演算法：能力部分 **********************************//
        /* 推薦演算法：能力部分（依據使用者lackAbilities 去資料庫找具有該能力的活動推薦） */
        let lackAbilities = user.lackAbilities;
        for(var i = 0; i < lackAbilities.length; i++){
            let act = await Activity.find({      
                abilities: { $in: [ lackAbilities[i] ] }  
            });
            for(var j = 0; j < act.length; j++){ //有包含lackAbilities[i]的所有活動
                let id = act[j].id;
                if(count == 0){ //跑第一次不需檢查活動是否重複
                    activities[count] = act[j];
                    count++;
                }
                else{
                    var flag = true;
                    for(var k = 0; k < count; k++){ 
                        if(id == activities[k].id) {
                            flag = false; //若重複則不加入
                            break;
                        }
                    }
                    if(flag == true){
                        activities[count] = act[j];
                        count++;
                    }
                }   
            }
        }

        /* 若無任何推薦依據（無興趣學類和文章），則推薦所有活動 */
        if(activities.length == 0 || userDepart == null) {
            activities = await Activity.find();
        }
        return activities;
    },

    signUp: async ( args ) => {
        try {

            const { name, email, password } = args.input;
            const abilityScoreSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            const topDepartment = [];
            const lackAbilities = [];

            var newUser = new User({
                name: name,
                email: email,
                password: password,
                abilityScoreSum: abilityScoreSum,
                topDepartment: topDepartment,
                lackAbilities: lackAbilities
            })

            // save the user to database
            await newUser.save(function(err) {
                if (err) throw err;
            });

            const tags = {};
            const department = [];
            const newTag = await Tag.create({ userId: newUser.id, tags: tags});
            const newDepartment = await InterestedDepartment.create({userId: newUser.id, department: department, lackAbilities: lackAbilities});


            return { 
                ...newUser._doc, 
                id: newUser.id 
            }
          } catch (error) {
            throw error
          }
    },

    logIn: async ( args ) => {
        const email = args.email;
        const password = args.password;
        
        // let user = await User.findOne({ email: email }, function(err, user) {
        //     if (err) throw err;
        
        //     // isMatch equals true if the password matches, otherwise equals false
        //     user.comparePassword(password, function(err, isMatch) {
        //         if (err) throw err;

        //         if(!isMatch) {
        //             user = null;
        //         }
        //     });
        // });
        let user = await User.findOne({ email: email });

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if(!isPasswordCorrect) {
            throw new Error('Invalid Credentials!');
        }

        return user;
    },

    updateName: async ( args ) => {
        const userId = args.userId;
        const name = args.name;
        await User.updateOne({ _id: userId }, {name: name});
        let user = await User.findOne({ _id: userId });
        return user;
    },

    createRecord: async ( args ) => {
        try {

            const userId = args.userId;
            const title = args.title;
            const description = args.description;
            const images = args.images;
            const tags = {};
            const feeling = args.feeling;
            const score = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

            var newImages;
            if(images == null){
                newImages = [];
            } else {
                newImages = images;
            }

            const newRecord = await Record.create({ userId: userId, title: title, description: description, tags: tags, images: newImages, feeling: feeling, score: score});

            // save the record to database
            await newRecord.save(function(err) {
                if (err) throw err;
            });
            
            return newRecord;

          } catch (error) {
            throw error
          }
    },

    updateRecord: async ( args ) => {

        const id = args.id;
        const title = args.title;
        const description = args.description;
        const feeling = args.feeling;
        //const images = args.images;

        let record = await Record.findOne({ _id: id });
        await Record.updateOne({ _id: id }, {title:title, description: description, feeling: feeling});
        record = await Record.findOne({ _id: id });
        return record;                      
    },

    deleteRecord: async ( args ) => {
        let herokuKey = btoa(":" + "da2b7ab1-5cb2-4d08-8083-ddde1ebd107c" + "\n");
        const ids = args.ids;
        for(var i = 0; i < ids.length; i++) {
            /* 刪除該篇文章分數 */
            // let record = await Record.findOne({ _id: ids[i] });
            // let score = record.score;
            // let userId = record.userId;
            // let user = await User.findOne({_id: userId });
            // let abilityScoreSum = user.abilityScoreSum;
            // for(var j = 0; j < score.length; j++){
            //     abilityScoreSum[j] = abilityScoreSum[j]-score[j];
            // }
            // await User.updateOne({_id: userId},{abilityScoreSum:abilityScoreSum});


            // var requestBody = JSON.stringify(
            //     {
            //         "articles": [
            //             {
            //                 "article_id": ids[i],
            //                 "abilities": {
            //                  },
            //                  "if_new": false
            //             } 
            //         ]
            //     }
            // );
            
            // var oReq = new XMLHttpRequest();
            // oReq.open("POST", "https://desolate-refuge-17724.herokuapp.com/result",true);
            // //oReq.setRequestHeader("Content-Type", "application/json");
            // oReq.setRequestHeader("Accept", "application/vnd.heroku+json; version=3")
            // oReq.setRequestHeader("Authorization", herokuKey);
            // oReq.send(requestBody);
            /* 刪除該篇文章 */
            await Record.deleteOne({ _id: ids[i] });
        }
    },

    addUserTag: async ( args ) => {
        const userId = args.userId;
        const tagName = args.tagName;

        let thisOne = await Tag.findOne({ userId: userId });
        for( const key of thisOne.tags.keys()){
            var value = thisOne.tags.get(key);
            if(value == tagName) return "The tag was already existed.";
        }
        var newKey = generate();
        thisOne.tags.set(newKey,tagName);

        await Tag.updateOne({ userId: userId }, { tags: thisOne.tags });
        return [newKey, tagName];
    },

    updateTagName: async ( args ) => {
        const userId = args.userId;
        const tagKey = args.tagKey;
        const tagName = args.tagName;

        var exist = false;
        let thisOne = await Tag.findOne({ userId: userId });
        for( const key of thisOne.tags.keys()){
            if(key == tagKey) {
                thisOne.tags.set(key, tagName);
                await Tag.updateOne({ userId: userId }, { tags: thisOne.tags });
                exist = true;
                break;
            }
        }
        if(exist == false) return "The keyId does not exist.";

        let records = await Record.find({ userId: userId });
        for(var i = 0; i < records.length; i++){
            for( const key of records[i].tags.keys()){
                if(key == tagKey){
                    records[i].tags.set(key, tagName);
                    await Record.updateOne({ _id: records[i].id }, { tags: records[i].tags });
                }
            }
        } 
        
        return [tagKey, tagName];
    },

    deleteUserTag: async ( args ) => {
        const userId = args.userId;
        const tagKey = args.tagKey;

        var exist = false;
        let thisOne = await Tag.findOne({ userId: userId });
        for( const key of thisOne.tags.keys()){
            if(key == tagKey) {
                thisOne.tags.delete(key);
                await Tag.updateOne({ userId: userId }, { tags: thisOne.tags });
                exist = true;
                break;
            }
        }
        if(exist == false) return false;

        let records = await Record.find({ userId: userId });
        for(var i = 0; i < records.length; i++){
            for( const key of records[i].tags.keys()){
                if(key == tagKey){
                    records[i].tags.delete(key);
                    await Record.updateOne({ _id: records[i].id }, { tags: records[i].tags });
                }
            }
        } 
        
        return exist;
    },

    createTagsFromRecord: async ( args ) => {
        const recordId = args.recordId;
        const userId = args.userId;
        const tagName = args.tagName;

        let thisRecord = await Record.findOne({ _id: recordId });
        if(thisRecord.userId != userId) return false;

        for( const key of thisRecord.tags.keys()){
            var value = thisRecord.tags.get(key);
            if(value == tagName) return false;
        }

        let thisOne = await Tag.findOne({ userId: userId });
        for( const key of thisOne.tags.keys()){
            var value = thisOne.tags.get(key);
            if(value == tagName) return false;
        }

        var newKey = generate();
        thisOne.tags.set(newKey,tagName);
        await Tag.updateOne({ userId: userId }, { tags: thisOne.tags });
        thisRecord.tags.set(newKey,tagName);
        await Record.updateOne({ _id: recordId }, { tags: thisRecord.tags });
        
        return true;
    },

    addTagsToRecord: async ( args ) => {
        const recordId = args.recordId;
        const tags = args.tags;

        //console.log(tags);

        let record = await Record.findOne({ _id: recordId });
        var recordTags = new Map();
        //console.log(recordTags);

        for( let key of Object.keys(tags)){
            //console.log('key:', key);
            var value = tags[key];
            //console.log('value:', value);
            recordTags.set(key,value);
        }
        //console.log(recordTags);
        await Record.updateOne({ _id: recordId }, {tags: recordTags});
        record = await Record.findOne({ _id: recordId });
        return record;
        
    },

    addImages: async ( args ) => {
        const recordId = args.recordId;
        const images = args.images;

        let record = await Record.findOne({ _id: recordId });
        
        await Record.updateOne({ _id: recordId }, {images: images});
        return images;
    },

    addImage: async ( args ) => {
        const recordId = args.recordId;
        const image = args.image;

        let record = await Record.findOne({ _id: recordId });
        var recordImages = record.images;
        var size = recordImages.length;
        recordImages[size] = image;
        
        await Record.updateOne({ _id: recordId }, {images: recordImages});
        return recordImages;
    },

    deleteImage: async ( args ) => {
        const recordId = args.recordId;
        const uri = args.uri;

        let record = await Record.findOne({ _id: recordId });
        var recordImages = record.images;

        var exist = false;
        for(var i = 0; i < recordImages.length; i++){
            if(recordImages[i] == uri){
                recordImages.splice(i, 1);
                //recordImages[i] = null;
                exist = true;
                break;
            }
        }
        if(exist == false) return ["The uri does not exist."];
        await Record.updateOne({ _id: recordId }, {images: recordImages});
        return recordImages;
    },

    uploadDocument: async ( args ) => {
        const recordIds = args.recordId;
        var res = "";
        for(var i = 0; i < recordIds.length; i++){
            let record = await Record.findOne({ _id: recordIds[i] });
            res += (record.title + "T" + record.description + "T" + "---");  
        }
        return res;
    },

    createActivity: async ( args ) => {
        try {
            const { type, department, major, title, host, location, time, url, description, abilities,image } = args.input;

            const newActivity = await Activity.create({ type:type, department:department, major:major, title:title, host:host, location:location, time:time, url:url, description:description, abilities:abilities, image:image});

            // save the record to database
            await newActivity.save(function(err) {
                if (err) throw err;
            });
            
            return newActivity;

          } catch (error) {
            throw error
          }
    },

    createInterestedDepartment: async ( args ) => {
        try {
            const userId = args.userId;
            const department = args.department;
            const lackAbilities = [];

            const newInterestedDepartment = await InterestedDepartment.create({ userId: userId, department: department, lackAbilities: lackAbilities});

            // save the record to database
            await newInterestedDepartment.save(function(err) {
                if (err) throw err;
            });
            
            return newInterestedDepartment;

          } catch (error) {
            throw error
          }
    },

    updateInterestedDepartment: async ( args ) => {
            const userId = args.userId;
            const department = args.department;

            await InterestedDepartment.updateOne({userId: userId}, {department: department},  {upsert: true})
            updatedInterestedDepartment = await InterestedDepartment.findOne({userId: userId});
            // const depart = updatedInterestedDepartment.department
            // const arr = [];
            // for(var i = 0; i < depart.length; i++){
            //     arr[i] = index_to_major[parseInt(depart[i])]+" 學類";
            // }
            await computeAbilities(updatedInterestedDepartment);
            return updatedInterestedDepartment;
    },

    forNLPTestDelete: async() => {
        let records = await Record.find();
        for(var i = 0; i < records.length; i++){
            let score = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            let id = records[i]._id;
            await Record.updateOne({_id:id},{score:score});
        }
    }
 
}

