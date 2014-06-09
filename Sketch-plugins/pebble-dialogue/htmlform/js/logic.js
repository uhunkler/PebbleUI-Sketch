/*global console:false */

var de = de || {};

/**
 * Set up the namespace object and the variables.
 * @type {de.unodo}
 */
de.unodo = {
  conn: null,
  host: 'ws://localhost:',
  port: 9912,
  switcher: document.querySelector("#switcher"),
  rotateBtn: document.querySelector("#rotate-btn"),
  rotatorBtn: null,
  timepageBtn: null,
  generatepage: document.querySelector("#generate"),
  timepage: document.querySelector("#time"),
  btns: document.querySelector("#buttons"),
  settimeBtn: document.querySelector("#settime-btn"),
  addtimeBtn: document.querySelector("#addtime-btn"),
  runclockBtn: document.querySelector("#runclock-btn"),
  btn: document.querySelector("#calculate"),
  undoBtn: document.querySelector("#undo"),
  output: document.querySelector("#output"),
  fieldTable: document.querySelector("#fields"),
  fieldTableBody: null,
  templates: document.querySelector("#templates"),
  templatesRow: null,
  queryStrName: '[data-type="name"]',
  queryStrAngle: '[data-type="angle"]',
  runclockRunning: null
};

/**
 * In the init method the event handlers are set up
 */
de.unodo.init = function() {
  this.connectWS();
  this.fieldTableBody = this.fieldTable.querySelector("tbody");
  this.templatesRow = this.templates.querySelector("table tr");
  this.rotatorBtn = this.switcher.querySelector("#rotator-btn");
  this.timepageBtn = this.switcher.querySelector("#time-btn");

  document.addEventListener("submit", this.submitHandler, false);
  document.addEventListener("focusin", this.focusinHandler, false);
  this.switcher.addEventListener("click", this.switcherClickHandler, false);
  this.rotateBtn.addEventListener("click", this.rotateSendHandler, false);
  this.btn.addEventListener("click", this.rotateDupSendHandler, false);
  this.undoBtn.addEventListener("click", this.undoSendHandler, false);
  this.settimeBtn.addEventListener("click", this.settimeSendHandler, false);
  this.addtimeBtn.addEventListener("click", this.addtimeSendHandler, false);
  this.runclockBtn.addEventListener("click", this.runclockSendHandler, false);
  this.fieldTable.addEventListener("click", this.tableClickHandler, false);
  this.startMutationObserver();

  this.generatepage.style.height =
    window.getComputedStyle(this.generatepage.querySelector('.wrap'), null)
    .getPropertyValue("height");

  this.rotatorBtn.className += ' pure-button-disabled';
};

/**
 * Connect a WebSocket and establish a feedback handler.
 * Make the buttons visible when the connection is opened.
 */
de.unodo.connectWS = function() {
  this.conn = new WebSocket(this.host + this.port);
  this.conn.onopen = function() {
    de.unodo.rotateBtn.className =
      de.unodo.rotateBtn.className.replace(/\s*hidden\s*/, '');
    de.unodo.btns.className =
      de.unodo.btns.className.replace(/\s*hidden\s*/, '');
    de.unodo.settimeBtn.className =
      de.unodo.settimeBtn.className.replace(/\s*hidden\s*/, '');
    de.unodo.addtimeBtn.className =
      de.unodo.addtimeBtn.className.replace(/\s*hidden\s*/, '');
    de.unodo.runclockBtn.className =
      de.unodo.runclockBtn.className.replace(/\s*hidden\s*/, '');
    de.unodo.displayMessage("Connected to Sketch! ");
    de.unodo.generatepage.style.height =
      de.unodo.getInnerHeight(de.unodo.generatepage);
  };

  this.conn.onmessage = function(e) {
    console.log(e.data);
    de.unodo.displayMessage(e.data);
  };
};

/**
 * Send the message via websocket, check if the websocket is still open
 * and establish a new connection if not.
 *
 * @param {string} msg   The message to send
 */
de.unodo.sendOnWS = function(msg) {
  if (this.conn.readyState === 3) {
    this.conn = new WebSocket(this.host + this.port);
    this.conn.onopen = function() {
      this.conn.send(msg);
    };
  } else if (this.conn.readyState === 1) {
    this.conn.send(msg);
  }
};

/**
 * Display a text in the page footer.
 *
 * @param {event} e The event object
 */
de.unodo.displayMessage = function(msg) {
  // Can't use this here because it referes to the function now.
  this.output.innerHTML = msg;
};

/**
 * Block submit events.
 *
 * @param {event} e The event object
 */
de.unodo.submitHandler = function(e) {
  e.preventDefault();
};

/**
 * On the focus event stop the timer if it runs.
 *
 * @param {event} e The event object
 */
de.unodo.focusinHandler = function() {
  if (de.unodo.runclockRunning) {
    de.unodo.runclockBtn.click();
  }
};

/**
 * The event handler for the button click event.
 * Display the form values in the page footer.
 *
 * @param {event} e The event object
 */
de.unodo.displayFormValuesHandler = function(e) {
  e.preventDefault();

  // Can't use this here because it referes to the function now.
  var data = de.unodo.getFormValues();
  de.unodo.output.innerHTML = JSON.stringify(data);
};

/**
 * The event handler for the top button click events.
 *
 * @param {event} e The event object
 */
de.unodo.switcherClickHandler = function(e) {
  e.preventDefault();

  de.unodo.changePage(e.target.id);
};

/**
 * The event handler for the top button click events.
 *
 * @param {event} e The event object
 */
de.unodo.changePage = function(id) {
  switch (id) {
    case 'rotator-btn':
      de.unodo.generatepage.style.height =
        de.unodo.getInnerHeight(de.unodo.generatepage);
      de.unodo.timepage.style.height = '0';
      if (de.unodo.rotatorBtn.className.indexOf('pure-button-disabled') === -1) {
        de.unodo.rotatorBtn.className += ' pure-button-disabled';
      }
      de.unodo.timepageBtn.className =
        de.unodo.timepageBtn.className.replace(/\s*pure-button-disabled\s*/, '');
      break;
    case 'time-btn':
      de.unodo.timepage.style.height =
        de.unodo.getInnerHeight(de.unodo.timepage);
      de.unodo.generatepage.style.height = '0';
      if (de.unodo.timepageBtn.className.indexOf('pure-button-disabled') === -1) {
        de.unodo.timepageBtn.className += ' pure-button-disabled';
      }
      de.unodo.rotatorBtn.className =
        de.unodo.rotatorBtn.className.replace(/\s*pure-button-disabled\s*/, '');
      break;
  }
};

/**
 * Calculate the computed height of the inner wrap element.
 * Needed for the CSS transition which works best with fixed height values.
 * @param {DOMNode} ele The DOM Node to work with
 */
de.unodo.getInnerHeight = function(ele) {
  return window.getComputedStyle(ele.querySelector('.wrap'), null)
    .getPropertyValue("height");
};

/**
 * The event handler for the button click event.
 *
 * @param {event} e The event object
 */
de.unodo.rotateSendHandler = function(e) {
  e.preventDefault();

  // Can't use this here because it referes to the function now.
  de.unodo.sendOnWS('[sketch:coscript] ../pebble-dialogue/rotate.jstalk');
};

/**
 * The event handler for the button click event.
 *
 * @param {event} e The event object
 */
de.unodo.rotateDupSendHandler = function(e) {
  e.preventDefault();

  // Can't use this here because it referes to the function now.
  de.unodo.sendOnWS('[sketch:coscript] ../pebble-dialogue/rotate-duplicate.jstalk');
};

/**
 * Run the script which executes the UI "undo" command.
 *
 * @param {event} e The event object
 */
de.unodo.undoSendHandler = function(e) {
  e.preventDefault();

  // Can't use this here because it referes to the function now.
  de.unodo.sendOnWS('[sketch:osascript] ../UI/sketch3_undo.scpt');
};

/**
 * Run the script which sets the time
 *
 * @param {event} e The event object
 */
de.unodo.settimeSendHandler = function(e) {
  e.preventDefault();

  de.unodo.sendOnWS('[sketch:coscript] ../pebble-dialogue/settime.jstalk');
};

/**
 * Run the script which adds some time
 *
 * @param {event} e The event object
 */
de.unodo.addtimeSendHandler = function(e) {
  e.preventDefault();

  var time = de.unodo.addTime(document.querySelector("#settime").value,
    document.querySelector("#addtime").value);
  document.querySelector("#settime").value = time;

  de.unodo.sendOnWS('[sketch:coscript] ../pebble-dialogue/settime.jstalk');
};

/**
 * Trigger the script which runs the clock
 *
 * @param {event} e The event object
 */
de.unodo.runclockSendHandler = function(e) {
  e.preventDefault();

  if (de.unodo.runclockRunning) {
    clearTimeout(de.unodo.runclockRunning);
    de.unodo.runclockRunning = null;
    de.unodo.runclockBtn.textContent = 'Run';
  } else {
    de.unodo.runclockBtn.textContent = 'Stop';
    de.unodo.runclockRunning = setTimeout(de.unodo.runclockRun, 1);
  }
};

/**
 * Run the clock
 *
 * @param {event} e The event object
 */
de.unodo.runclockRun = function() {
  if (de.unodo.runclockRunning) {
    var time = de.unodo.addTime(document.querySelector("#settime").value,
      document.querySelector("#addtime").value);
    document.querySelector("#settime").value = time;

    de.unodo.sendOnWS('[sketch:coscript] ../pebble-dialogue/settime.jstalk');

    de.unodo.runclockRunning = setTimeout(de.unodo.runclockRun, 1000);
  }
};

/**
 * The delegate event handler for all click events on an element
 * in the form.
 *
 * @param {event} e The event object
 */
de.unodo.tableClickHandler = function(e) {
  e.preventDefault();

  if (e.target.nodeName.toLowerCase() === 'button') {
    if (e.target.id.indexOf('remove') !== -1) {
      de.unodo.removeRow(e.target);
    } else if (e.target.id.indexOf('add') !== -1) {
      de.unodo.addRow(e.target);
    }
  }
};

/**
 * Rempove a row.
 *
 * @param {DMOElement} target The selected row
 */
de.unodo.removeRow = function(target) {
  var pattern = /.*(\d{1,})/,
    row,
    rowNo,
    match;

  match = target.id.match(pattern);
  if (match && match[1] !== undefined) {
    rowNo = match[1];
    row = this.fieldTableBody.querySelector('#row' + rowNo);
    if (row) {
      this.fieldTableBody.removeChild(row);
    }
  }
};

/**
 * Add a row.
 *
 * Add the new row before the last row the avoid the "+" and "-"
 * button switching. The last row will be the only row with a "+" button.
 *
 * @param {DMOElement} target The selected row
 */
de.unodo.addRow = function(target) {
  var lastRow,
    cloneRow;

  // Clone the template row and get the last row
  cloneRow = this.templatesRow.cloneNode(true);
  lastRow = target.parentNode.parentNode;

  // Move the values from the last row into the new added row.
  cloneRow.querySelector(this.queryStrName).value =
    lastRow.querySelector(this.queryStrName).value;
  cloneRow.querySelector(this.queryStrAngle).value =
    lastRow.querySelector(this.queryStrAngle).value;
  lastRow.querySelector(this.queryStrName).value = '';
  lastRow.querySelector(this.queryStrAngle).value = '';

  // Add the new row before the last row with the "+" button
  this.fieldTableBody.insertBefore(cloneRow, lastRow);
};

/**
 * Renumber the table rows, field names and buttons.
 */
de.unodo.renumberRows = function() {
  de.unodo.generatepage.style.height =
    de.unodo.getInnerHeight(de.unodo.generatepage);

  var rows = this.fieldTableBody.querySelectorAll("tr"),
    row,
    no,
    element,
    i;

  for (i = rows.length; i >= 0; i--) {
    row = rows[i];
    if (row !== undefined) {
      no = i + 1;
      row.id = 'row' + no;
      row.querySelector(this.queryStrName).name = 'name' + no;
      row.querySelector(this.queryStrAngle).name = 'angle' + no;
      element = row.querySelector('[data-type="add"]');
      if (element) {
        element.id = 'add' + no;
      }
      element = row.querySelector('[data-type="remove"]');
      if (element) {
        element.id = 'remove' + no;
      }
    }
  }
};

/**
 * Get all form values. Loop through all rows and get the values
 * of the fields with the data "-name" and "-angle" tags.
 *
 * Don't include the values from rows with empty fields.
 */
de.unodo.getFormValues = function() {
  var rows = this.fieldTableBody.querySelectorAll("tr"),
    data = [],
    row,
    nameVal,
    angleVal,
    i,
    l;

  // Loop through all rows and add the field values to the data array
  for (i = 0, l = rows.length; i <= l; i++) {
    row = rows[i];
    if (row !== undefined) {
      nameVal = row.querySelector(this.queryStrName).value;
      angleVal = row.querySelector(this.queryStrAngle).value;

      // Don't include rows with an empty form field
      if (nameVal !== '' && angleVal !== '') {
        data.push({
          name: nameVal,
          angle: parseInt(angleVal, 10)
        });
      }
    }
  }

  return data;
};

/**
 * Return the input value for the webview communication.
 */
de.unodo.returnRotateAngle = function() {
  return document.querySelector("#rotangle").value;
};

/**
 * Return the input value for the webview communication.
 */
de.unodo.returnSetTime = function() {
  return document.querySelector("#settime").value;
};

/**
 * Return the form data as JSON string for the webview communication.
 */
de.unodo.returnDuplicateData = function() {
  var result = this.getFormValues();

  return JSON.stringify(result);
};

/**
 * Set up the mutation observer to watch for changes on the table
 * with the input fields to be able to detect when rows have been
 * removed or added. When the row number changes the rows and fields
 * need to be renumbered.
 */
de.unodo.startMutationObserver = function() {
  // Select the target node
  var target = this.fieldTableBody;

  // Create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // console.log(mutation.type);
      if (mutation.type === 'childList') {
        de.unodo.renumberRows();
      }
    });
  });

  // Configuration of the observer:
  var config = {
    // attributes: true,
    // characterData: true,
    childList: true
  };

  // Pass in the target node, as well as the observer options
  observer.observe(target, config);

  // Later, to stop observing
  // observer.disconnect();
};

/**
 * Add two time strings. The hours and minutes may be ommited.
 * Examples:
 * '00:00:05' and '5' are the same.
 * '00:03:16' and '3:16' are the same.
 *
 * @param {string} t1 The first time string
 * @param {string} t2 The second time string
 */
de.unodo.addTime = function(t1, t2) {
  // Add leading zeros
  var z = function(n) {
    return (n < 10 ? '0' : '') + n;
  },
    x1, x2, s, m, h, d, i;

  // Split the strings in arrays
  t1 = t1.toString().split(/\D/) || [];
  t2 = t2.toString().split(/\D/) || [];

  // Add 0 for hours and min if not present in the time arrays
  if (t1.length === 1 && t1[0] === '') {
    t1 = [];
  }
  for (i = (3 - t1.length); i > 0; i--) {
    t1.unshift(0);
  }

  if (t2.length === 1 && t2[0] === '') {
    t2 = [];
  }
  for (i = (3 - t2.length); i > 0; i--) {
    t2.unshift(0);
  }

  // Calculate the time in seconds
  x1 = parseInt(t1[0], 10) * 60 * 60 + parseInt(t1[1], 10) * 60 +
    parseInt(t1[2], 10);
  x2 = parseInt(t2[0], 10) * 60 * 60 + parseInt(t2[1], 10) * 60 +
    parseInt(t2[2], 10);

  // Add the two times and split the sum into hour, min, sec
  s = x1 + x2;

  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;

  // return the formatted time string
  return z(h) + ':' + z(m) + ':' + z(s);
};

// Prepare the form
de.unodo.init();

console.log('done');
