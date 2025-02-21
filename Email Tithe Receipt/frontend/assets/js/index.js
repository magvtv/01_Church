
/*
1. want to have a manner for having dynamic biblical and egw quotes

*/

document.addEventListener("DOMContentLoaded", async function () {
    try {
        let response = await fetch('../../../data/dummyChurchMembers.json')
        let members = await response.json()

        // select random member from dataset
        let member = members[Math.floor(Math.random() * members.length)]
        document.getElementById("memberName").textContent = member.name(" ")[0] + ","   //get first name only


        let titheAmount = Math.floor(Math.random() * 5000) + 500
        document.getElementById("titheAmount").textContent = `KES ${titheAmount}`  //random contribution KES 500 - 5500

    } catch (error){
        console.error("Error fetching data: ", error)
    }
    
})