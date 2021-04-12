const Resource = require('../../../methods/resource')
const CurRaceInfo = require('../../../methods/curraceinfo')
const NextRaceInfo = require('../../../methods/nextraceinfo')
const UserInfo = require('../../../methods/users')
const BettingInfo = require('../../../methods/bettinginfo')
const OddsInfo = require('../../../methods/oddsinfo')
const TipsInfo = require('../../../methods/tipsinfo')
const fs = require('fs');

const directory = './uploads/odds/';

function settingController(){
    return {
        async index(req, res){
            console.log('ajax index request is received');
            let resData = {};

            //user table data: 
            const users = await UserInfo.getUserList('', 1, 10);
            resData['users'] = users;
            
            //current race table data: [{name: '', sp: '', color: ''},{...}]
            const curraces = await CurRaceInfo.getCurRaceInfo();
            if(curraces.result) resData['curRaceData'] = curraces.result;

            //next race table data: [{name: '', sp: '', color: ''},{...}]
            const nextraces = await NextRaceInfo.getNextRaceInfo();
            if(nextraces.result) resData['nextRaceData'] = nextraces.result;
            
            /*resource data: 
                {
                    stream_url: '',
                    pdf_url: '',
                    cur_race_time: '',
                    cur_race_name: '',
                    next_race_time: '',
                    next_race_name: '',
                    card_title: '',
                    tip_source: ''
                }*/
            const result = await Resource.getResource();
            if(result.result) resData['resource'] = result.result;
            
            const bettinginfo = await BettingInfo.getBettingInfo();
            if(bettinginfo.result) resData['bettinginfo'] = bettinginfo.result;
            const tipsinfo = await TipsInfo.getTipsInfo();
            if(tipsinfo.result) resData['tipsinfo'] = tipsinfo.result;
            const oddsinfo = await OddsInfo.getOddsInfo();
            if(oddsinfo.result) resData['oddsinfo'] = oddsinfo.result;

            resData['excelList'] = '';
            try {
                fs.readdir(directory, (err, files) => {
                    if(err) console.error(`Error occured while list Excel files ${err}`);
                    else {
                        resData['excelList'] = files;
                        console.log('List of excel files :');
                        console.log(files);
                    }
                    res.render('admin/setting', resData);
                });
            } catch (err) {
                console.error(`Error occured while list Excel files ${err}`);
                res.render('admin/setting', resData);
            }
        },

        async user(req, res){
            console.log('ajax user request is received');
            let { filter, page, count } = req.body;
            let resData = {};

            //user table data: 
            const users = await UserInfo.getUserList(filter, page, count);
            resData = users;
            // console.log("SENDDATA:");
            // console.log(resData);
            if(resData.error) res.status(500).send(resData);
            else res.status(200).send(resData);
        },

        async userDelete(req, res){
            console.log('ajax userDelete request is received');
            let { username } = req.body;
            let resData = {};

            //user table data: 
            const users = await UserInfo.removeUserByName(username);
            resData = users;
            if(!resData.result) res.status(404).send(resData);
            else res.status(200).send(resData);
        },

        async access(req, res){
            console.log('ajax access request is received');
            let { username, type, checked } = req.body;
            // console.log(req.body);
            let resData = {};

            const users = await UserInfo.updateUserDataByName(username, {access: type, method: checked=='true' ? 'add' : 'del'});
            resData = users;
            // console.log(resData);
            if(!resData.result) res.status(500).send(resData);
            else res.status(200).send(resData);
        },

        async upload(req, res) {
            console.log('ajax upload request is received');
            try {
                if(!req.files) {
                    console.log('Error: Pdf file must be supplied while uploading.')
                    res.status(403).send ({message: 'Error: Select the upload file.'});
                } else {
                    //Use the name of the input field (i.e. "file") to retrieve the uploaded file
                    let file = req.files.file;
                    
                    //Use the mv() method to place the file in upload directory (i.e. "uploads")
                    file.mv('./uploads/card/' + 'card.pdf');
        
                    //flash response
                    console.log('Upload pdf success.');
                    res.status(200).send({result: true});
                }
            } catch (err) {
                console.log('Error occured while upload :', err);
                res.status(500).end({message: err});
            }
        },

        async oddUpload(req, res) {
            console.log('ajax oddUpload request is received');
            try {
                if(!req.files) {
                    console.log('Error: Excel file must be supplied while uploading.')
                    res.status(403).send ({message: 'Error: Select the upload file.'});
                } else {
                    //Use the name of the input field (i.e. "file") to retrieve the uploaded file
                    let file = req.files.file;
                    
                    fs.readdir(directory, (err, files) => {
                        const isExist = files.indexOf(file.name);

                        //Use the mv() method to place the file in upload directory (i.e. "uploads")
                        file.mv('./uploads/odds/' + file.name);
            
                        //flash response
                        console.log('Upload excel success.');
                        if(isExist != -1) res.status(200).send({result:true, error: "File already exist, it's updated"})
                        else res.status(200).send({result: true});
                    });
                }
            } catch (err) {
                console.log('Error occured while upload :', err);
                res.status(500).end({message: err});
            }
        },

        async oddDelete(req, res) {
            console.log('ajax oddDelete request is received');
            try {
                if(!req.body.fileName) {
                    console.log('Error: Excel file must be supplied while deleteing.')
                    res.status(403).send ({message: 'Error: Select the delete file.'});
                } else {
                    //Use the name of the input field (i.e. "file") to retrieve the deleted file
                    let file = req.body.fileName;
                    
                    //Use the mv() method to place the file in delete directory 
                    fs.unlink(directory + file, (err, files) => {
                        if(err) 
                        {
                            console.error(`Error occured while delete Excel files ${err}`);
                            res.status(404).send({result: false, error: err});
                        }
                        else {
                            console.log('Delete excel success.');
                            res.status(200).send({result: true, error: ''});
                        }
                    });
                }
            } catch (err) {
                console.log('Error occured while delete :', err);
                res.status(500).end({message: err});
            }
        },

        async oddClear(req, res) {
            console.log('ajax oddClear request is received');
            try {

                //Use the unlint() method to delete the file in upload directory 
                fs.readdir(directory, (err, files) => {
                    if(err) 
                    {
                        console.error(`Error occured while clear Excel files ${err}`);
                        res.status(404).send({result: false, error: err});
                    }
                    else {
                        
                        for (const file of files) {
                            fs.unlink(directory + file, err => {
                                if(err) {
                                    console.error(`Error occured while clear Excel files ${err}`);
                                    res.status(404).send({result: false, error: err});
                                }
                            });
                        }
                        console.log('Delete all excels success.');
                        res.status(200).send({result: true, error: ''});
                    }
                });
            } catch (err) {
                console.log('Error occured while clear :', err);
                res.status(500).end({message: err});
            }
        }
    }
}

module.exports = settingController;