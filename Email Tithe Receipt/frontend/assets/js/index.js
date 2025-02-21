
/*
1. want to have a manner for having dynamic biblical and egw quotes

*/

document.addEventListener("DOMContentLoaded", async function () {
    try {
        let membersResponse = await fetch('../../../backend/data/dummyChurchMembers.json')
        let quotesResponse = await fetch('../../../backend/data/shortQuotes.json')
        let members = await membersResponse.json()
        let quotes = await quotesResponse.json()


        // select random member and quote from dataset
        let member = members[Math.floor(Math.random() * members.length)]
        let randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

        document.getElementById("memberName").textContent = member.name.split(" ")[0] + ","   //get first name only

        // update quote section
        document.getElementById("quoteDetail").textContent = `"${randomQuote.quote}"`
        document.getElementByClassName(".quote__source").textContent = `- ${randomQuote.source}`
    

        let titheAmount = Math.floor(Math.random() * 5000) + 500
        document.getElementById("titheAmount").textContent = `KES ${titheAmount}`  //random contribution KES 500 - 5500

    } catch (error) {
        console.error("Error fetching data: ", error)
    }
    
})