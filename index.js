function start(){
  const socket_j = io();
  let projectId_j = Entry.projectId;
  let username_j = window.user ? window.user.username : '';

  socket_j.on('connect', ()=>{
    console.log('connet to jevi-realTime');
    setEntryBlocks();
    if(Entry.variableContainer.getListByName(".jeviLog") != undefined){
      Entry.variableContainer.getListByName(".jeviLog").appendValue("start");
    }
  });

  socket_j.on('join', (room, joinUser) => {
    if(Entry.variableContainer.getListByName(".jeviUser") != undefined){
      Entry.variableContainer.getListByName(".jeviUser").appendValue(joinUser);
    }
  });
  socket_j.on('leave', (room, leaveUser) => {
    if(Entry.variableContainer.getListByName(".jeviUser") != undefined){
      for(let i = 0; i < Entry.variableContainer.getListByName(".jeviUser").array_.length; i++){
        if(Entry.variableContainer.getListByName(".jeviUser").array_[i].data == leaveUser){
          Entry.variableContainer.getListByName(".jeviUser").deleteValue(i);
        }
      }
    }
  });
  socket_j.on('set_variable', (room, data) => {
    if(Entry.variableContainer.getVariableByName(data.varName) != undefined){
      Entry.variableContainer.getVariableByName(data.varName).setValue(data.value);
    }
  });
  socket_j.on('set_list', (room, data) => {
    let list = Entry.variableContainer.getListByName(data.listName);
    if(list != undefined){
      if(data.value != null){
        if(!data.isDel){
          if(data.index == -1){
            list.appendValue(data.value);
          }else{
            list.insertValue(data.index, data.value);
          }
        }else{
          list.replaceValue(data.index, data.value);
        }
      }else{
        list.deleteValue(data.index);
      }
    }
  });
}

function reset(){
  let setList_j = Entry.variableContainer.getListByName(".jeviSet");
  if(jeviSet != undefined){
    let lists_j = [];
    for(let i = 0; i < setList_j.array_.length; i++){
      lists_j.push(setList_j.array_[i].data);
    }
    start();
  }
}

$(document).ready(()=> {
  reset();
});

//소켓 emit함수
/*
socket_j.emit('join', projectId, username);
socket_j.emit('leave', projectId, username);
socket_j.emit('set_variable', projectId, {varName: varName, value: value});
socket_j.emit('set_list', projectId, {listName: listName, index: index, value: value, isDel: true});
*/

function setEntryBlocks(){
  Entry.block.set_variable.func = function func(sprite, script) {
    var variableId = script.getField('VARIABLE', script);
    var value = script.getValue('VALUE', script);
    var variable = Entry.variableContainer.getVariable(variableId, sprite);

    variable.setValue(value);
    if(lists_j.indexOf(variable.name_ + ".v") != -1){
      socket_j.emit('set_variable', projectId_j, {varName: variable.name_, value: value_});
    }
    return script.callReturn();
  }

  Entry.block.change_variable.func = function func(sprite, script) {
    var variableId = script.getField('VARIABLE', script);
    var value = script.getValue('VALUE', script);
    var fixed = 0;

    if (value == false && typeof value === 'boolean') {
      throw new Error('Type is not correct');
    }

    var variable = Entry.variableContainer.getVariable(variableId, sprite);
    var variableValue = variable.getValue();
    var sumValue;

    if (Entry.Utils.isNumber(value) && variable.isNumber()) {
      value = Entry.parseNumber(value);
      variableValue = Entry.parseNumber(variableValue);
      fixed = Entry.getMaxFloatPoint([value, variable.getValue()]);
      sumValue = new BigNumber(value).plus(variableValue).toNumber().toFixed(fixed);
    } else {
      sumValue = "".concat(variableValue).concat(value);
    }

    variable.setValue(sumValue);
    if(lists_j.indexOf(variable.name_ + ".v") != -1){
      socket_j.emit('set_variable', projectId_j, {varName: variable.name_, value: value_});
    }
    return script.callReturn();
  }

  Entry.block.add_value_to_list.func = function func(sprite, script) {
    var listId = script.getField('LIST', script);
    var value = script.getValue('VALUE', script);
    var list = Entry.variableContainer.getList(listId, sprite);

    list.appendValue(value);
    if(lists_j.indexOf(list.name_) != -1){
      socket_j.emit('set_list', projectId_j, {listName: list.name_, index: -1, value: value, isDel: false});
    }
    return script.callReturn();
  }

  Entry.block.remove_value_from_list.func = function func(sprite, script) {
    var listId = script.getField('LIST', script);
    var value = script.getValue('VALUE', script);
    var list = Entry.variableContainer.getList(listId, sprite);
    var array = list.getArray();

    if (!array || !Entry.Utils.isNumber(value) || value > array.length) {
      throw new Error('can not remove value from array');
    }

    list.deleteValue(+value);
    if(lists_j.indexOf(list.name_) != -1){
      socket_j.emit('set_list', projectId_j, {listName: list.name_, index: value, value: null, isDel: true});
    }
    return script.callReturn();
  }

  Entry.block.insert_value_to_list.func = function(sprite,script) {
    var listId = script.getField('LIST', script);
    var list = Entry.variableContainer.getList(listId, sprite);
    var array = list.getArray();
    var index = script.getNumberValue('INDEX',script);
    var data = script.getValue('DATA',script);

    if (!array || !Entry.Utils.isNumber(index) || index == 0 || index > array.length + 1) {
        throw new Error('can not insert value to array');
    }

    list.insertValue(index, data);
    if(lists_j.indexOf(list.name_) != -1){
      socket_j.emit('set_list', projectId_j, {listName: list.name_, index: index, value: data, isDel: false});
    }
    return script.callReturn();
  }

  Entry.block.change_value_list_index.func = function(sprite,script) {
    var listId = script.getField('LIST', script);
    var list = Entry.variableContainer.getList(listId, sprite);
    var array = list.getArray();
		var index = script.getNumberValue('INDEX', script);
		var data = script.getValue('DATA', script);

    if (!array || !Entry.Utils.isNumber(index) || index > array.length) {
        throw new Error('can not insert value to array');
    }

    list.replaceValue(index, data);
    if(lists_j.indexOf(list.name_) != -1){
      socket_j.emit('set_list', projectId_j, {listName: list.name_, index: index, value: data, isDel: true});
    }
    return script.callReturn();
  }
}
