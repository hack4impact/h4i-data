# Creating a Volunteer in Volunteers Table

```bash
mutation {
  addVolunteer(
    volunteer: {
      first_name: "Jane"
      last_name: "Doe"
      email: "janedoe@example.com"
      graduation_date: "2026-06-18"
      volunteer_status: STUDENT
      H4I_email: "jane@hack4impact.org"
      volunteer_type: CHAPTER
      university_id: "860b69b4-a14e-41d9-a367-2632b342e549"
    }
  )
}
```