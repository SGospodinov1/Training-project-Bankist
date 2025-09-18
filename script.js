'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Test data
const account1 = {
  owner: 'Stoyan Gospodinov',
  movements: [
    { sum: 200, date: '2019-11-18T21:31:17.178Z' },
    { sum: 455.23, date: '2019-12-23T07:42:02.383Z' },
    { sum: -306.5, date: '2020-01-28T09:15:04.904Z' },
    { sum: 25000, date: '2020-04-01T10:17:24.185Z' },
    { sum: -642.21, date: '2020-05-08T14:11:59.604Z' },
    { sum: -133.9, date: '2020-05-27T17:01:17.194Z' },
    { sum: 79.97, date: '2020-07-11T23:36:17.929Z' },
    { sum: 1300, date: '2020-07-12T10:51:36.790Z' },
  ],
  interestRate: 1.2, // %
  pin: 1111,
  local: 'bg-BG',
};

const account2 = {
  owner: 'Kristiana Bakalova',
  movements: [
    { sum: 5000, date: '2019-11-01T13:15:33.035Z' },
    { sum: 3400, date: '2019-11-30T09:48:16.867Z' },
    { sum: -150, date: '2019-12-25T06:04:23.907Z' },
    { sum: -790, date: '2020-01-25T14:18:46.235Z' },
    { sum: -3210, date: '2020-02-05T16:33:06.386Z' },
    { sum: -1000, date: '2020-04-10T14:43:26.374Z' },
    { sum: 8500, date: '2020-06-25T18:49:59.371Z' },
    { sum: -30, date: '2020-07-26T12:01:20.894Z' },
  ],
  interestRate: 1.5,
  pin: 2222,
  local: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const createUsernames = function (accs) {
  accs.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

const displayDate = function (dateInfo, localFormat) {
  const date = new Date(dateInfo);

  const daysPassed = Math.round(
    Math.abs(new Date() - date) / (1000 * 60 * 60 * 24)
  );

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return Intl.DateTimeFormat(localFormat).format(date);
};

const displayTransactions = function (account, sort = false) {
  const transactions = sort
    ? account.movements.slice().sort((a, b) => a.sum - b.sum)
    : account.movements;

  containerMovements.innerHTML = '';

  transactions.forEach(function (mov, i) {
    const type = mov.sum > 0 ? 'deposit' : 'withdrawal';

    const dateString = displayDate(mov.date, account.local);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${dateString}
    </div>
          <div class="movements__value">${mov.sum}€</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcBalance = function (account) {
  account.balance = account.movements.reduce((acc, el) => acc + el.sum, 0);

  labelBalance.textContent = `${account.balance}€`;
};

const transactionsSummary = function (account) {
  const deposits = account.movements
    .filter(el => el.sum > 0)
    .reduce((acc, el) => acc + el.sum, 0);
  labelSumIn.textContent = `${deposits.toFixed(2)}€`;

  const withdrawals = account.movements
    .filter(el => el.sum < 0)
    .reduce((acc, el) => acc + Math.abs(el.sum), 0);
  labelSumOut.textContent = `${withdrawals.toFixed(2)}€`;

  const interests = account.movements
    .filter(el => el.sum > 0)
    .map(el => el.sum * (account.interestRate / 100))
    .filter(el => el > 1)
    .reduce((acc, el) => acc + el, 0);
  labelSumInterest.textContent = `${interests.toFixed(2)}€`;
};

const logOutTimer = function () {
  let time = 300;

  const tick = function () {
    const minutes = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = `${time % 60}`.padStart(2, 0);

    labelTimer.textContent = `${minutes}:${seconds}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = '0';
    }

    time--;
  };

  tick();
  timer = setInterval(tick, 1000);
};

const updateUI = function (account) {
  //Display transactions
  displayTransactions(account);
  //Display balance
  calcBalance(account);
  //Display summary
  transactionsSummary(account);

  if (timer) {
    clearInterval(timer);
  }

  logOutTimer();
};

let currAccount = {};
let timer;

// Events

btnLogin.addEventListener('click', function (e) {
  //Prevent from submition
  e.preventDefault();
  //Finding corect account and implement Login
  currAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = '100';

    labelWelcome.textContent = `Good Day, ${currAccount.owner.split(' ')[0]}`;

    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    const dateNow = new Date();
    const options = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };

    labelDate.textContent = Intl.DateTimeFormat(
      currAccount.local,
      options
    ).format(dateNow);

    updateUI(currAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const accForTransfer = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  const sumForTransfer = Number(inputTransferAmount.value);

  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();

  if (
    accForTransfer &&
    currAccount.balance >= sumForTransfer &&
    sumForTransfer > 0 &&
    accForTransfer.username !== currAccount.username
  ) {
    const date = new Date();

    const newTransfer = {
      sum: sumForTransfer,
      date: date.toISOString(),
    };

    const newWithdrawal = {
      sum: sumForTransfer * -1,
      date: date.toISOString(),
    };

    accForTransfer.movements.push(newTransfer);
    currAccount.movements.push(newWithdrawal);

    updateUI(currAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loan = Number(inputLoanAmount.value);

  if (loan > 0 && currAccount.movements.some(mov => mov.sum >= loan * 0.1)) {
    setTimeout(function () {
      const date = new Date();

      const newLoan = {
        sum: loan,
        date: date.toISOString(),
      };

      currAccount.movements.push(newLoan);

      updateUI(currAccount);
    }, 3000);

    inputLoanAmount.value = '';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currAccount.username &&
    Number(inputClosePin.value) === currAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currAccount.username
    );

    accounts.splice(index, 1);
  }

  containerApp.style.opacity = '0';
  labelWelcome.textContent = 'Log in to get started';
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

let isSorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayTransactions(currAccount, !isSorted);
  isSorted = !isSorted;
});
