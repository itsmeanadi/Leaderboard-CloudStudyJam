// Test data format
const testData = {
  entries: [
    {
      rank: 1,
      "User Name": "Test User",
      "User Email": "test@example.com",
      "# of Skill Badges Completed": 5,
      "# of Arcade Games Completed": 3,
      "All Skill Badges & Games Completed": "No",
      "Google Cloud Skills Boost Profile URL": ""
    }
  ],
  frozenUsers: {}
};

console.log("Test data:", JSON.stringify(testData, null, 2));

// Test the API endpoint
fetch("http://localhost:3000/api/leaderboard", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then(response => response.json())
  .then(data => console.log("Success:", data))
  .catch(error => console.error("Error:", error));