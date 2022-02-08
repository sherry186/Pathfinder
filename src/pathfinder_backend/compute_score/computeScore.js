const math = require('mathjs')
const process = require('process')
const fs = require('fs')
const mongoose = require('mongoose')
const Record = require('../models/record')
const User = require('../models/user')
const InterestedDepartment = require('../models/interestedDepartment')
//const {total_major} = require('../table/totalData')
/*
const read = new Promise((resolve, reject) => {
    fs.readFile('./department_weights.json', (err, data) => {
        if (err) reject(err);
        const string = data.toString();
        const DEPARTMENT_WEIGHTS = JSON.parse(string);
        resolve(DEPARTMENT_WEIGHTS)
    })
})
/*
async function computeScore(result) {
    let DEPARTMENT_WEIGHTS;
    const WEIGHT_MATRIX = [];
    const DEPARTMENT_ARRAY = [];
    const KEYS = ["外語能力", "閱讀理解", "文字創作", "藝術創作", "寫作表達", "助人能力", "領導協調", "說服推廣", "文書處理", "組織能力", "抽象推理", "科學能力", "數學推理", "圖形推理", "計算能力", "操作能力", "空間理解", "機械推理"]
    await read
    .then(output => {
        DEPARTMENT_WEIGHTS = output;
        
    })
    .catch(err => {
        throw err;
    });
    //console.log(DEPARTMENT_WEIGHTS)
    DEPARTMENT_WEIGHTS.forEach(element => {
        const weights = element['weights'];
        const department = element['department'];
        const row = []

        KEYS.forEach(key => {
            if (!(key in weights)) {
                weights[key] = 0;
            }
            row.push(weights[key])
        });

        DEPARTMENT_ARRAY.push(department);
        WEIGHT_MATRIX.push(row);
    });

    obj = {
        'departments': DEPARTMENT_ARRAY,
        'weightMatrix': WEIGHT_MATRIX
    }
    fs.writeFile('./algorithmTools.json', JSON.stringify(obj), (err) => {
        if (err) throw err;
        
    })
}
*/
const compareFunc_1 = (a, b) => {
    if (a[1] > b[1]) return 1;
    else if (a[1] < b[1]) return -1;
    return 0
};
const compareFunc_2 = (a, b) => {
    if (a[1] > b[1]) return -1;
    else if (a[1] < b[1]) return 1;
    return 0
};

const read = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${process.cwd()}/compute_score/${file}.json`, (err, data) => {
            if (err) reject(err);
            else {
                //console.log(`Data: ${data}`)
                const string = data.toString();
                const tools = JSON.parse(string);
                resolve(tools);
            }
        });
    });
}


async function computeScore(result) {
    // Prepare tools
    const KEYS = ["外語能力", "閱讀理解", "文字創作", "藝術創作", "寫作表達", "助人能力", "領導協調", "說服推廣", "文書處理", "組織能力", "抽象推理", "科學能力", "數學推理", "圖形推理", "計算能力", "操作能力", "空間理解", "機械推理"]
    let DEPARTMENTS, WEIGHT_MATRIX_RAW;
    await read('algorithmTools')
    .then(output => {
        DEPARTMENTS = output['departments'];
        WEIGHT_MATRIX_RAW = output['weightMatrix'];
    })
    .catch(err => {console.log(err)});

    //const WEIGHT_MATRIX = math.matrix(WEIGHT_MATRIX_RAW);
    // -----------------------------
    // type: array
    const articles_meta = result['articles'];
    const userIncrementScore = {};

    const articlePromises = articles_meta.map(meta => {
        return new Promise(async (resolve, reject) => {
            await Record.findById(meta['article_id'])
                    .then(async (doc) => {
                        const userId = doc.userId.toString();
                        //console.log(`user id: ${userId}, ${typeof userId}`)
                        const oldScore = JSON.parse(JSON.stringify(doc.score));
                        const oldScoreMinus = oldScore.map(score => -score);
                
                        let updatedScore = new Array(18).fill(0);
                        const abilities = Object.keys(meta['abilities']);
                        abilities.forEach(ability => {
                            const index = KEYS.findIndex(key => key === ability);
                            updatedScore[index] = meta['abilities'][ability];
                        });

                        doc.score = updatedScore;
                        await doc.save()
                                .then((output) => {})
                                .catch(err => {reject(err)})
                
                        
                        
                        // update total score
                        if (!(userId in userIncrementScore)) {
                            userIncrementScore[userId] = math.add(updatedScore, oldScoreMinus);
                        } else {
                            userIncrementScore[userId] = math.add(userIncrementScore[userId], updatedScore, oldScoreMinus);
                        }
                        
                        resolve('done')
                    })
                    .catch(err => {
                        resolve(err)
                    })
            
        });
    });

    await Promise.all(articlePromises)
    .then((values) => {})
    .catch(err => {throw err});
    
    // calculate department
    const USERS = Object.keys(userIncrementScore);
    // ascend order

    const userPromises = USERS.map(userId => {
        return new Promise(async (resolve, reject) => {
            await User.findById(userId)
                    .then(async (doc) => {
                        
                        //console.log(`id: ${doc._id}`);
                        const originalSum = doc.abilityScoreSum;
                        //console.log(`increment: ${userIncrementScore[userId]}`)
                        const sum = math.add(originalSum, userIncrementScore[userId]);
                        

                        // Forward KL divergence
                        const denominator = sum.reduce((a, b) => a+b);
                        //console.log(`denom: ${denominator}`)
                        if (denominator === 0) return;
                        const distribution = sum.map(score => (score / denominator));
                        
                        // Shape: [["department_name", KLDivergence, [divergence atoms]]]
                        let sortedDivergence = [];

                        for (let i=0; i< DEPARTMENTS.length; i++){
                            // Individual department's Forward KLDivergence
                            let groundTruth = WEIGHT_MATRIX_RAW[i];
                            let KLDivergence = 0;
                            let divergenceAtom = new Array(18).fill(0);
                            for (let j=0; j< 18; j++){
                                if (groundTruth[j] === 0) {}
                                else {
                                    if (distribution[j] === 0) distribution[j] = Number.EPSILON;
                                    let division = groundTruth[j] / distribution[j];
                                    let atom = groundTruth[j] * Math.log(division);
                                    KLDivergence += atom;
                                    divergenceAtom[j] = atom;
                                }
                            }
                            sortedDivergence.push([DEPARTMENTS[i], KLDivergence, divergenceAtom])
                        }
                        //console.log(`distribution: ${distribution}`)
                        sortedDivergence.sort(compareFunc_1);
                        const topFive = sortedDivergence.slice(0, 5);
                        //console.log(`Top: ${topFive}`)
                        const sortedDepartmentTopFive = topFive.map(item => item[0]);
                        const divergenceAtomsTopFive = topFive.map(item => item[2]);
                        const lackOfAbilities = [];
                        divergenceAtomsTopFive.forEach(atoms => {
                            const pairedEntropy = [];
                            for (let i=0; i<18; i++){
                                pairedEntropy.push([i, atoms[i]]);
                            }
                            pairedEntropy.sort(compareFunc_2);
                            // pick top 3
                            const topFiveLackOfAbilities = pairedEntropy.slice(0, 3).map(entropy => entropy[0]);
                            topFiveLackOfAbilities.forEach(index => {
                                if (!(lackOfAbilities.includes(index))){
                                    lackOfAbilities.push(index)
                                }
                            })
                        });
                        // [[[1, entropy], []]]
                        doc.abilityScoreSum = sum;
                        doc.topDepartment = sortedDepartmentTopFive;
                        doc.lackAbilities = lackOfAbilities;

                        await doc.save()
                                .then(output => {})
                                .catch(err => {reject(err)})
                        
                        // update abilities
                        const interestedDepartmentDoc 
                        = InterestedDepartment.find({userId: mongoose.Types.ObjectId(userId)})
                                                .then(output => output)
                                                .catch(err => resolve(err))
                        await computeAbilities(interestedDepartmentDoc, doc)
                        .then(output => resolve(output))
                        .catch(err => resolve(err))
                    })
                    .catch(err => {
                        resolve(err)
                        //reject(err)
                    });
        })
    })


    await Promise.all(userPromises)
    .then(values => {})
    .catch(err => {throw err})

    
    return true
}

async function computeAbilities(doc, userDoc=null) {
    let departments = doc.department;
    const mapping = await read('mapping')
                            .then(output => output)
    departments = departments.map(index => {
        if (index in mapping) return mapping[index];
        else return -1;
    });

    let DEPARTMENTS, WEIGHT_MATRIX_RAW;
    await read
    .then(output => {
        DEPARTMENTS = output['departments'];
        WEIGHT_MATRIX_RAW = output['weightMatrix'];
    })
    .catch(err => {console.log(err)});

    // get distribution
    if (userDoc === null) {
        userDoc = await User.findById(doc.userId)
                                .then(result => result)
                                .catch(err => {})
    } 
    

    const denominator = userDoc.abilityScoreSum.reduce((a, b) => a+b);
    //if (denominator === 0) return;
    const distribution = userDoc.abilityScoreSum.map(score => (score / denominator));
    let totalDivergence = new Array(18).fill(0);

    // array
    departments.forEach(id => {
        //index = DEPARTMENTS.findIndex(element => element === department);
        if (id !== -1) {
            const weights = WEIGHT_MATRIX_RAW[id];
            let divergenceAtom = new Array(18).fill(0);
            for (let j=0; j< 18; j++){
                if (weights[j] === 0) {}
                else {
                    if (distribution[j] === 0) distribution[j] = Number.EPSILON;
                    let division = weights[j] / distribution[j];
                    let atom = weights[j] * Math.log(division);
                    divergenceAtom[j] = atom;
                }
            }
            totalDivergence = math.add(totalDivergence, divergenceAtom);
        }
    })

    let pairedDivergence = [];

    for (let i=0; i < 18; i++) {
        pairedDivergence.push([i, totalDivergence[i]]);
    }
    pairedDivergence.sort(compareFunc_2);
    const topFiveLack = pairedDivergence.slice(0, 5).map(element => element[0]);

    doc.lackAbilities = topFiveLack;
    return await doc.save()
                    .then(result => 'OK')
                    .catch(err => err)
}

/*
async function main(){
    const departments = await read.then(tools => tools['departments'])
console.log(departments)
let mapping = {};
total_major.forEach(major => {
    const index = major['index'];
    const title = `${major['name']} 學類`;
    const offset = departments.findIndex(name => name === title);
    if (offset !== -1) {
        mapping[index] = offset;
    }
// const departments = read.then(tools => tools['departments'])
// total_major.forEach(major => {
//     const index = major['index'];
//     const title = `${major['name']} 學類`;
//     const offset = departments.findIndex(name => name === title);

// })

fs.writeFile('./mapping.json', JSON.stringify(mapping), (err) => {
    if (err) throw err;
    
})
*/



module.exports = {
    computeScore,
    computeAbilities
}