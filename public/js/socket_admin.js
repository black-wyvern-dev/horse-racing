$('#cur_race_info_save').click(function(){
    var tabledata = [];
    var name = [];
    var sp = [];
    $('#cur_race_info_table').find(".info_name").each(function( index ) {
        name.push($( this ).val());
    });
    $('#cur_race_info_table').find(".info_sp").each(function( index ) {
        sp.push($( this ).val());
    });
    for(let i=0; i<name.length; i++)
        tabledata.push({name:name[i], sp:sp[i]});
    Client.socket.emit('cur_race_save', {tabledata: tabledata, time:$('#cur_race_time').val(), name:$('#cur_race_name')});
});