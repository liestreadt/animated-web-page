const DB_NAME = 'GUESTBOOK';
const DB = {
  db: localStorage,
  records: [],
  /**
   * Получение всех записей
   * @returns {[]}
   */
  getAllRecords() {
    const records = this.db.getItem(`${DB_NAME}_records`);
    this.records = JSON.parse(records || '[]');
    return this.records;
  },
  /**
   * Сохранение всех записей
   */
  saveRecords() {
    this.db.setItem(`${DB_NAME}_records`, JSON.stringify(this.records));
  },
  /**
   * Добавление новой записи
   * @param record
   * @returns {[]}
   */
  addRecords(record) {
    this.records = [record, ...this.records];
    this.saveRecords();
    return this.records;
  },
  /**
   * Удаление записи
   * @param deleteId
   * @returns {[]}
   */
  deleteRecord(deleteId) {
    this.records = this.records.filter(({id}) => id !== deleteId);
    this.saveRecords();
    return this.records;
  },
  /**
   * Обновление записи
   * @param record
   * @returns {[]}
   */
  updateRecord(record) {
    this.records = this.records.map(c => c.id === record.id ? record : c);
    this.saveRecords();
    return this.records;
  }
};

let arrayDB = DB.getAllRecords();

////////////////////////////////////////
////////////// Обработчики /////////////

$(document).ready(function() {
  
  $('#btn1').on('click', function (e) {
    e.preventDefault();
    addComm();
    $('#comment-thanks').css('display', 'block')
    setTimeout(showmodal, 5000, 'comment-thanks');
  });

  $('body').on('click', '#btn-Ok-thanks', function (e) {
    e.preventDefault();
    $('#comment-thanks').css('display', 'none')
  });
  
  $('body').on('click', '#btn-Ok-delete', function (e) {
    e.preventDefault();
    $('#comment-delete').css('display', 'none')
  });

  $('body').on('click', '#btn-Ok-update', function (e) {
    e.preventDefault();
    $('#comment-update').css('display', 'none')
  });

  $('#search-date-from').keydown(function(e) {
    e.preventDefault();    
  });

  $('#search-date-to').keydown(function(e) {
    e.preventDefault();    
  });

  $('#btn-search').on('click', function (e) {
    e.preventDefault();
    let searhingAuthor = ($('body').find('#search-field').val());
    filterByAuthor(searhingAuthor)
    let searhingDateFrom = ($('body').find('#search-date-from').val());
    let searhingDateTo = ($('body').find('#search-date-to').val());
    filterByDate(searhingDateFrom, searhingDateTo);
    $('body').find('#search')[0].reset()
  });

  $('#comments-list').on('click', '#delete-btn', function (e) {
    e.preventDefault();
    let commToDelete = $(this).parents('article');
    $('#comment-delete').css('display', 'block')
    setTimeout(showmodal, 5000, 'comment-delete');
    commToDelete.remove();
    DB.deleteRecord(`${commToDelete.attr('id')}`);
  });

  $('#comments-list').on('click', '#btn-modal-window', function (e) {
    e.preventDefault();
    let editId = getModalId.bind(this);
    let thisArticleId = editId().substr(0, 6);
    $(`#${editId()}`).css('display', 'block');
    $(`#${editId()}`).find('textarea').val(`${getDBObj(thisArticleId).message}`);
  });   

  $('#comments-list').on('click', '#btn-comments-modal', function (e) {
    let commsId = getCommsModalId.bind(this);
    $(`#${commsId()}`).css('display', 'block');
  });

  $("body").on('click', "#btn-Cansel-edit", function (e) {
    e.preventDefault();
    let canselId = getModalId.bind(this);
    $(`#${canselId()}`).css('display', 'none');
  });

  $("body").on('click', "#btn-Cansel-comments", function (e) {
    e.preventDefault();
    let canselCommsId = getCommsModalId.bind(this);
    $(`#${canselCommsId()}`).css('display', 'none');
  }); 

  $("body").on('click', "#btn-Save-edit", function (e) {
    e.preventDefault();  
    let saveId = getModalId.bind(this);
    let thisArticleId = saveId().substr(0, 6);
    let editedDate = new Date();
    editedDate.setHours(editedDate.getHours() + 3);

    let editDateToShow = changeDate(JSON.parse(JSON.stringify(editedDate)));
    let pubDateToShow = changeDate(getDBObj(thisArticleId).pubDate)
    $(this).parents('article').find('small').eq(0).empty().append(`Pub date: ${pubDateToShow}   Edited: ${editDateToShow}<br>`);

    let messageEditText = $(this).parents('form').eq(0).find('textarea').val();
    $(this).parents('article').find('p').eq(0).empty().text(messageEditText);

    editCommMessage(thisArticleId, messageEditText, editedDate);
    $(`#${saveId()}`).css('display', 'none');
    $(`#${saveId()}`).find('form').eq(0)[0].reset();
    $('#comment-update').css('display', 'block')
    setTimeout(showmodal, 5000, 'comment-update');
  });

  $("body").on('click', "#btn-Save-comments", function (e) {
    e.preventDefault();
    let saveCommsModalId = getCommsModalId.bind(this);
    let thisArticleId = saveCommsModalId().substr(0, 6);

    let subName = $(`#${saveCommsModalId()}`).find('input').val();
    let subText = $(`#${saveCommsModalId()}`).find('textarea').val();    

    editCommSubs(thisArticleId, subName, subText);
    $(`#${saveCommsModalId()}`).css('display', 'none');
    $(`#${saveCommsModalId()}`).find('form').eq(0)[0].reset();
    let a = getDBObj(thisArticleId);
    if (a.comments.length == 1 ) {
      $(`#${thisArticleId}-cs`).children().eq(0).append(getCloneSub(subName, subText));
      $(`#${thisArticleId}-sl`).slick({slidesToShow: 2,});
    } else {
       $(`#${thisArticleId}-sl`).slick('slickAdd', `${getCloneSub(subName, subText)}`)
    }
  });

    {for (let i = 0; i < arrayDB.length; i++) {
      arrayDB = DB.getAllRecords();
      if ($(`#${arrayDB[i].id}-sl`).children().length > 0) {
        $(`#${arrayDB[i].id}-sl`).slick({slidesToShow: 2,});
        } else {}
    }};

});
////////////////////////////////////////
////////////////////////////////////////



////////////////////////////////////////
// Функции редактирования базы данных //

function createId() {
  return '_' + Math.random().toString(36).substr(2, 5);
};

function createNewComm() {
  let id = createId();
  let name = $('#name').val();
  let message = $('#message').val();
  let pubDate = new Date();
  pubDate.setHours(pubDate.getHours() + 3);

  let newCommentary = {
      id: id,
      author: name,
      message: message,
      pubDate: pubDate,
      editDate: null,
      comments: [],
  };
  return newCommentary;
};

function addComm() {
  let commentary = createNewComm();
  DB.addRecords(commentary);
  let properComm = DB.getAllRecords()[0];
  renderComm(properComm);
  $("#add-comments")[0].reset();
};

function editCommMessage(ID, edMessage, edDate) {
  let CommToEdit = getDBObj(`${ID}`);
  CommToEdit.message = edMessage;
  CommToEdit.editDate = edDate;
  DB.updateRecord(CommToEdit);
};

function editCommSubs(ID, subName, subText) {
  let CommToEditSubs = getDBObj(`${ID}`);
  let subs = {
      author: subName,
      comments_Text: subText,
  };
  CommToEditSubs.comments.push(subs);
  DB.updateRecord(CommToEditSubs);
};

////////////////////////////////////////
////////////////////////////////////////



////////////////////////////////////////
////// Функции форматирования дат //////

function changeDate(pub) {
  let commPubDate = pub.substr(0, 10);
  let commPubTime = pub.substr(11, 5);
  let newPubDate = commPubDate.replace(/-/g, '.');
  let properPubDate = `${newPubDate.substr(8, 2)}.${newPubDate.substr(5, 2)}.${newPubDate.substr(0, 4)}`;
  let resultPubDate = `${commPubTime} ${properPubDate} `;
  return resultPubDate;
};

function changeDateDB(date) {
  let standardDate = new Date(
    date.substr(0, 4),
    date.substr(5, 2) - 1,
    date.substr(8, 2),
  );
  return standardDate
};

function changeDateFrom(dateFrom) {
  let standardDateFrom = new Date(
    dateFrom.substr(6, 4),
    dateFrom.substr(3, 2) - 1,
    dateFrom.substr(0, 2),
  );
  return standardDateFrom
};

function changeDateTo(dateTo) {
  let standardDateTo = new Date(
    dateTo.substr(6, 4),
    dateTo.substr(3, 2) - 1,
    dateTo.substr(0, 2),
  );
  return standardDateTo
};

////////////////////////////////////////
////////////////////////////////////////



////////////////////////////////////////
///// Функции поиска  и фильтрации /////

function getDBObj(Id) {
  arrayDB = DB.getAllRecords();
  let searchingObj = arrayDB.find(func => func.id === Id);
  return searchingObj;
};

// function hasDBAuthor(name) {
//   arrayDB = DB.getAllRecords();
//   for (let i = 0; i < arrayDB.length; i++) {
//     let hasName = Object.values(arrayDB[i]).includes(name)
//     if (hasName === true && name != '') {
//       return true
//     }
//     else continue;
//   };
// };

function filterByAuthor(name) {
  arrayDB = DB.getAllRecords();
    for (let i = 0; i < arrayDB.length; i++) {
      if (arrayDB[i].author === name) {
        $('body').find(`#${arrayDB[i].id}`).css('display', 'block')
      } else {$('body').find(`#${arrayDB[i].id}`).css('display', 'none')}; 
    };
};

function hasDBDate(dateFrom, dateTo) {
  arrayDB = DB.getAllRecords();
  dateJSON = dateFrom
  for (let i = 0; i < arrayDB.length; i++) {
    let hasDateFrom = Object.values(arrayDB[i]).includes(dateFrom);
    let hasDateTo = Object.values(arrayDB[i]).includes(dateTo);
    if (hasDateFrom === true && hasDateTo === true) {
      return true
    }
    else continue;
  };
};

function filterByDate(dateFrom, dateTo) {
  arrayDB = DB.getAllRecords();
   if (dateFrom != '', dateTo != '') {
    for (let i = 0; i < arrayDB.length; i++) {
      if (changeDateDB(arrayDB[i].pubDate) >= changeDateFrom(dateFrom)
          && changeDateDB(arrayDB[i].pubDate) <= changeDateTo(dateTo)) {
        $('body').find(`#${arrayDB[i].id}`).css('display', 'block')
      } else {$('body').find(`#${arrayDB[i].id}`).css('display', 'none')}; 
    };
   } else return false;
};

function getModalId() {
  let modalId = $(this).parents('article').children().eq(1).attr('id');
  return modalId
};

function getCommsModalId() {
  let commsModalId = $(this).parents('article').children().eq(2).attr('id');
  return commsModalId
};

function getCommsId() {
  let commsId = $(this).parents('article').children().eq(4).attr('id');
  return commsId
};

////////////////////////////////////////
////////////////////////////////////////



////////////////////////////////////////
////////// Функции рендеринга //////////

function renderComm(comm) {
  let isEditDate = `Edited: `;
  if (comm.editDate == null) {isEditDate = ''}
  else {isEditDate += `${changeDate(comm.editDate)}`}

  let addingComm = `<article class='card' id = ${comm.id}>
      <div class="card-body">
        <h3  class="cart-title">${comm.author}</h3>
        <p>${comm.message}</p>
      </div>
      <div id = "${comm.id + '-m'}" class="modal">
        <div class="modal_content">
          <div class="card mt-2">
            <form action="#" class = "add-comments-modal">
             <div class="card-body">
              <h4 class="cart-title">Edit comment</h4>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea name="message" class="form-control" class = "message-modal" cols="30" rows="2"></textarea>
              </div>
                <button class="btn btn-primary" id ="btn-Save-edit">Save</button>
                <button class="btn btn-danger" id = "btn-Cansel-edit">Cansel</button>
             </div>
            </form>
          </div>
        </div>
      </div>
      <div id = "${comm.id + '-ms'}" class="modal">
        <div class="modal_content">
          <div class="card mt-2">
            <form action="#" id ="add-comments-modal-comments">
             <div class="card-body">
              <h4 class="cart-title">Add your comment</h4>
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" class="form-control">
              </div>
              <div class="form-group">
                <label for="message">Your comment</label>
                <textarea name="message" class="form-control"  cols="30" rows="2"></textarea>
              </div>
                <button class="btn btn-primary" id = "btn-Save-comments">Save</button>
                <button class="btn btn-danger" id = "btn-Cansel-comments">Cansel</button>
             </div>
            </form>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <small>Pub date: ${changeDate(comm.pubDate)}   ${isEditDate} <br></small>
         <button class="btn btn-secondary btn-sm" id = "btn-comments-modal">comments this</button>
         <button class="btn btn-primary btn-sm" id = "btn-modal-window">edit this</button>
         <button class="btn btn-danger btn-sm" id = "delete-btn">delete this</button>
      </div>
      <div id = "${comm.id + '-cs'}" class="sub-comments-list-new p-2">   
        <div id="${comm.id + '-sl'}" class="main-slider">
        </div>      
      </div>
  </article>`;
  $('#comments-list').append(addingComm);
};

function getCloneSub(name, text) {
  let cloneSub = `
      <article class="card">
      <div class="card-body">
        <h6>${name}</h6>
        <p>${text}</p>
      </div>
      </article>
      `;
      return cloneSub
};

function renderSubs(comm) {
  let subs = comm.comments;
  for (let i = 0; i < subs.length; i++) {
    $(`#${comm.id}-cs`).children().eq(0).append(getCloneSub(subs[i].author, subs[i].comments_Text));  
  };
};

function renderDBComms() {
  let newArr = arrayDB.reverse();
  for (let i = 0; i < newArr.length; i++) {
  renderComm(newArr[i]);
  renderSubs(newArr[i]);
  };
};

function showmodal(id) {
  $(`#${id}`).css('display', 'none');
}

renderDBComms();

////////////////////////////////////////
////////////////////////////////////////

DB.getAllRecords()