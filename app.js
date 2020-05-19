var budgetController = (function(){
function Income(description,value){
    this.id = 0;
    this.description=description;
    this.value=value;
}

function Expense(description,value){
this.id = 0;
this.description=description;
this.value = value;
this.percent;
}

var dataItems = {
    exp: [],
    inc: [],
    TIncome: 0,
    TExpense: 0
};

return {
    addItemToBC: function(item){
       var obj;
       if(item.type==='exp'){
           obj = new Expense(item.description,item.value);
           obj.type = 'exp';
           if(dataItems.TIncome>0)
           obj.percent = Math.round(item.value/dataItems.TIncome*100);
       }else{
        obj = new Income(item.description,item.value);
        obj.type = 'inc';
        
    }
      
       if(dataItems[item.type].length>0){
           obj.id=(dataItems[item.type][dataItems[item.type].length-1].id)+1;
       }
       dataItems[item.type].push(obj);

       return obj;
},
    updateTotals : function(){
        var sumExp=0, sumInc=0;
    dataItems.exp.forEach(function(cur){
     sumExp+=cur.value;
    })
    dataItems.inc.forEach(function(cur){
    sumInc+=cur.value;   
    });
    dataItems.TIncome = sumInc;
    dataItems.TExpense = sumExp;
    dataItems.exp.forEach(function(cur){
        if(dataItems.TIncome)
    cur.percent = Math.round(cur.value/dataItems.TIncome*100);
    else cur.percent = null;
    });
    return {
    expTot : dataItems.TExpense,
    incTot : dataItems.TIncome
    }
    
},
    updatePerc: function(){
        if(dataItems.TIncome !== 0)
        return Math.round(dataItems.TExpense/dataItems.TIncome*100);
        else return -1;
    },

    removeinBC: function(tAndId){
        var IDarr = dataItems[tAndId[0]].map(function(c){
            return c.id; 
        }); 
        var index = IDarr.indexOf(tAndId[1]);
        dataItems[tAndId[0]].splice(index,1);
},
retExp: function(){
    return dataItems.exp;
}
    

};
})();

var UIController = (function(){
    function formatEntry(type,entry){
        entry = Math.abs(entry);
        var str = entry.toFixed(2);
        var arr = str.split('.');

        var int = arr[0];
        var deci = arr[1]; 
        if(int.length>3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        var sign = (type==='inc'?'+ ':'- ');
        return sign+int+'.'+deci;
    }
    return {
        readData: function(){
            var T,D,V;
            T = document.querySelector('.add__type').value;
            D = document.querySelector('.add__description').value;
            V = parseFloat(document.querySelector('.add__value').value);
            document.querySelector('.add__description').value = '';
            document.querySelector('.add__value').value = '';
            document.querySelector('.add__description').focus();
            return {
                type: T,
                description: D,
                value: V
            };
        },
        displayItem: function(item){
            var html;
            if(item.type==='exp')
            html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"->---</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            else 
            html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            html = html.replace('%id%', item.id );
            html = html.replace('%description%', item.description );
            html = html.replace('%value%', formatEntry(item.type,item.value) );
            if(item.type === 'exp' && item.percent)
            html = html.replace('---',item.percent+'%');
            if(item.type==='exp'){
                document.querySelector('.expenses__list').insertAdjacentHTML('beforeend',html);
            }else document.querySelector('.income__list').insertAdjacentHTML('beforeend',html);

        },
        displayBudget: function(total){
            document.querySelector('.budget__income--value').textContent = formatEntry('inc',total.incTot);
            document.querySelector('.budget__expenses--value').textContent = formatEntry('exp',total.expTot);
            var Ty = (total.incTot-total.expTot)>0?'inc':'exp';
            document.querySelector('.budget__value').textContent = formatEntry(Ty,total.incTot-total.expTot);
},
        displayPercentages: function(perc){
            if(perc !== -1)
            document.querySelector('.budget__expenses--percentage').textContent = perc + '%';
            else document.querySelector('.budget__expenses--percentage').textContent = '---';
        },
        removeinUI: function(event){
            var el = event.target.parentNode.parentNode.parentNode.parentNode;
            el.parentNode.removeChild(el);
        },
        updateAllPerc: function(exp){
            var allPercNodes = document.querySelectorAll('.item__percentage');
            for(var i = 0; i<allPercNodes.length; i++){
                if(exp[i].percent)
                allPercNodes[i].textContent=exp[i].percent+'%';
                else allPercNodes[i].textContent='---';
            }
        }



};
}
)();

var controller = (function(BCon,UCon){
    function init(){
        eventHandlers();
UCon.displayBudget({
    incTot: 0,
    expTot: 0
});
document.querySelector('.budget__expenses--percentage').textContent = '---';
var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var thisDate = new Date();
var year = thisDate.getFullYear();
var month = thisDate.getMonth();
document.querySelector('.budget__title--month').textContent = Months[month]+', '+year;
    }
    function fetchID(obj){
        var element=obj.target;
        while(!element.id)
        element = element.parentNode;
        var idstr = element.id;
        var typeAndId = idstr.split('-');
        if(typeAndId[0]==='income')
        typeAndId[0]='inc';
        else typeAndId[0]='exp';
        typeAndId[1]=parseInt(typeAndId[1]);
        return typeAndId;

    }
    function mainFunc(){
        var newItem = UCon.readData();
        if(newItem.value){
            var newObj = BCon.addItemToBC(newItem);
            var Totals = BCon.updateTotals();
            UCon.displayItem(newObj);
            UCon.displayBudget(Totals);
            UCon.displayPercentages(BCon.updatePerc());
            UCon.updateAllPerc(BCon.retExp());
        }
  }
var eventHandlers = function(){
    document.querySelector('.add__btn').addEventListener('click',function(){
        mainFunc();
 });
    document.addEventListener('keypress',function(event){
        if(event.keyCode == 13 || event.which == 13)
        mainFunc();
    });
    document.querySelector('.container').addEventListener('click',function(event){
        
        var count = 0;
        var element=event.target;
        while(!element.id){
            element = element.parentNode;
            count++;
        }
        
        if(count===4){
            
            var typeAndId = fetchID(event);
            BCon.removeinBC(typeAndId);
            var Totals = BCon.updateTotals();
            UCon.displayBudget(Totals);
            UCon.displayPercentages(BCon.updatePerc());
            UCon.removeinUI(event);
            UCon.updateAllPerc(BCon.retExp());
            
    }
    });
    document.querySelector('.add__type').addEventListener('change',function(){
        document.querySelector('.add__type').classList.toggle('red-focus');
        document.querySelector('.add__description').classList.toggle('red-focus');
        document.querySelector('.add__value').classList.toggle('red-focus');
        document.querySelector('.add__btn').classList.toggle('red');
     });
}
init();
})(budgetController,UIController);