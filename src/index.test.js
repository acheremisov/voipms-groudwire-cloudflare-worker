// Test case 1: Successful balance retrieval
const API_USERNAME = 'your_username';
const API_PASSWORD = 'your_password';
getBalance(API_USERNAME, API_PASSWORD)
  .then((balance) => {
    console.log('Balance:', balance);
    // Add your assertions here to verify the balance value
  })
  .catch((error) => {
    console.error('Error:', error);
    // Add your assertions here to verify the error message
  });

// Test case 2: Failed balance retrieval
const wrongUsername = 'wrong_username';
const wrongPassword = 'wrong_password';
getBalance(wrongUsername, wrongPassword)
  .then((balance) => {
    console.log('Balance:', balance);
    // Add your assertions here to verify the balance value (should not be reached)
  })
  .catch((error) => {
    console.error('Error:', error);
    // Add your assertions here to verify the error message
  });