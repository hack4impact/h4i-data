8/21/2025 - OUT OF DATE

# Retreiving All Members' Information

```bash
query gettingAllMembers {
  getAllMembers {
    id
    name
    university
  }
}
```

---

# Getting A Specific Member's ID

```bash
query gettingMemberIdSophia {
  getMemberId(name: "sophia", university: "cal poly")
}
```

---

# Getting A Specific Project's ID

```bash
query gettingProjectIdBytesOfGood {
  getProjectId(project: "Bytes of Good", chapter: "GTech")
}
```

---

# Adding A Project

```bash
query addProjectTestMIT {
  addProject(project: "test", chapter: "MIT")
}
```

---

# Adding A Member

```bash
query addMemberKaylie {
  addMember(name: "Kaylie", university: "UC Santa Cruz")
}
```

---

# Deleting A Member

```bash
query deletingMemberKaylie {
  deleteMemberById(memberId: 87) # pick a number from the Member table to replace 87
}
```

---

# Adding A Member Project Link (Linking Project with Member)

```bash
query addMemberProjectSophiaMIT {
  addMemberProject(memberId: 2, projectId: 70)
}
```