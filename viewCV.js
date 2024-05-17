// document.addEventListener('DOMContentLoaded', function () {
//     // Fetch job offers from the server
//     fetch('/getCV')
//         .then(response => response.json())
//         .then(CVs => {
//             console.log('CVs:', CVs);
//             const CVList = document.getElementById('applied-resumes');
//             // console.log("job_post_id:", offer.job_post_id);
//             // Loop through job offers and display them with an "Apply" button
//             CVs.forEach(CV => {
//                 const listItem = document.createElement('li');
//                 const pdfBlob = new Blob([CV.CV]); // Assuming CV.CV contains binary PDF data
//                 const pdfUrl = URL.createObjectURL(pdfBlob);
//                 console.log("CV:", CV.upload_date);
//                  listItem.innerHTML = `
//                     <p>Company: ${CV.upload_date}</p>
//                     <iframe src="${pdfUrl}" width="100%" height="500px" style="border: none;"></iframe>
                    
//                 `;
//                 CVList.appendChild(listItem);
//             });
//         })
//         .catch(error => console.error('Error fetching job offers:', error));
// });


// document.addEventListener('DOMContentLoaded', function () {
//     // Fetch CVs from the server
//     fetch('/getCV')
//         .then(response => response.json())
//         .then(CVs => {
//             const CVList = document.getElementById('applied-resumes');

//             CVs.forEach(CV => {
//                 const listItem = document.createElement('li');
//                 const pdfBlob = new Blob([CV.CV], { type: 'application/pdf' }); // Assuming CV.CV contains binary PDF data
//                 // const pdfUrl = URL.createObjectURL(pdfBlob);
//                 const pdfUrl = 'http://localhost:yourport/pdf-directory/CV_2023-11-03T19_54_38.000Z.pdf';

//                 // Create a download link
//                 const downloadLink = document.createElement('a');
//                 downloadLink.href = pdfUrl;
//                 downloadLink.download = `CV_${CV.upload_date}.pdf`; // Set the filename for the downloaded file
//                 downloadLink.innerText = 'Download CV';

//                 listItem.innerHTML = `
//                     <p>Upload Date: ${CV.upload_date}</p>
//                     <a href="${pdfUrl}" target="_blank">View PDF</a>
//                 `;

//                 // Append the download link to the list item
//                 listItem.appendChild(downloadLink);

//                 CVList.appendChild(listItem);
//             });
//         })
//         .catch(error => console.error('Error fetching CVs:', error));
// });



document.addEventListener('DOMContentLoaded', function () {
    // Fetch CVs from the server
    fetch('/getCV')
        .then(response => response.json())
        .then(CVs => {
            const CVList = document.getElementById('applied-resumes');
            //const pdfUrl = URL.createObjectURL(new Blob([CVs.CV], { type: 'application/pdf' }));
            CVs.forEach(CV => {
                const listItem = document.createElement('li');
                //const pdfUrl = 'http://localhost:yourport/pdf-directory/CV_2023-11-03T19_54_38.000Z.pdf';

                listItem.innerHTML = `
                    <p>Upload Date: ${CV.upload_date}</p>
                    <p>Job Seeker's Email: ${CV.job_seeker_email}</p>
                    
                `;

                CVList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching CVs:', error));
});


// <a href="${pdfUrl}" target="_blank">View PDF</a> |
//                     <a href="${pdfUrl}" download>Download PDF</a>