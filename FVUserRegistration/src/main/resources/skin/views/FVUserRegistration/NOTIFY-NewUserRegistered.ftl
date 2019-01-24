<html>
<body>
Hello!<br /><br />
${fName} ${lName} registered for FirstVoices and selected <strong>${dialect}</strong> as their primary community portal.<br />
In their registration they mentioned being involved in language revitalization.<br/>

<#if comment != "">
    <p>They included this comment: </p>
    <p>${comment}</p>
</#if>

<p>
    If you are expecting this registration, you may want to promote them to an active role in your community portal by going here:<br/>
    <a href="https://www.firstvoices.com/tasks/users/${dialectId}">https://www.firstvoices.com/tasks/users/${dialectId}</a> (Note: you must be logged in to perform that action)
</p>

<p>You can also connect with them directly here ${email} or choose to ignore this email.</p>

<p>Please feel free to contact us at support@fpcc.ca for assistance or if you have any issues.</p>

<p>Regards,<br/>
The FirstVoices Team</p>
</body>
</html>