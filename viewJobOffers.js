// document.addEventListener('DOMContentLoaded', function () {
//     // Fetch job offers from the server
//     fetch('/getJobOffers')
//         .then(response => response.json())
//         .then(jobOffers => {
//             const jobOffersList = document.getElementById('job-offers');

//             // Loop through job offers and display them
//             jobOffers.forEach(offer => {
//                 const listItem = document.createElement('li');
//                 listItem.textContent = `Company: ${offer.company_name}, Title: ${offer.job_title}, Description:${offer.job_description} ,Location: ${offer.location}, Qualifications: ${offer.qualification},Salary: ${offer.salary}`;
//                 jobOffersList.appendChild(listItem);
//             });
//         })
//         .catch(error => console.error('Error fetching job offers:', error));
// });

document.addEventListener('DOMContentLoaded', function () {
    // Fetch job offers from the server
    fetch('/getJobOffers')
        .then(response => response.json())
        .then(jobOffers => {
            console.log('jobOffers:', jobOffers);
            const jobOffersList = document.getElementById('job-offers');
            // console.log("job_post_id:", offer.job_post_id);
            // Loop through job offers and display them with an "Apply" button
            jobOffers.forEach(offer => {
                const listItem = document.createElement('li');
                console.log("job_post_id:", offer.job_post_id);
                 listItem.innerHTML = `
                    <p>Company: ${offer.company_name}</p>
                    <p>Title: ${offer.job_title}</p>
                    <p>Description: ${offer.job_description}</p>
                    <p>Location: ${offer.location}</p>
                    <p>Qualifications: ${offer.qualification}</p>
                    <p>Salary: ${offer.salary}</p>
                    <form action="/apply" method="post" enctype="multipart/form-data">
                    <input type="file" name="resume" accept=".pdf" required >
                    <input type="hidden" name="job_post_id" value="${offer.job_post_id}">
                    <input type="submit" value="Apply" class="inputButton">
                    </form>
                `;
                jobOffersList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching job offers:', error));
});
