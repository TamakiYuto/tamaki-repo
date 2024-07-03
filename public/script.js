document.getElementById('apiButton').addEventListener('click', async () => {
    const responseDiv = document.getElementById('apiResponse');
    responseDiv.textContent = 'Loading...';
  
    try {
      const response = await fetch('https://yihg7xxrdb.execute-api.ap-northeast-1.amazonaws.com/prod/');
      const data = await response.json();
      responseDiv.textContent = data.message;
    } catch (error) {
      responseDiv.textContent = 'Error calling API';
      console.error(error);
    }
  });
  