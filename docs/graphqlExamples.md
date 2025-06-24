# getAllMembers
```bash
query gettingAllMembers {
  getAllMembers {
    id
    name
    university
  }
}
```

# getMemberId
query gettingMemberIdSophia {
  getMemberId(name: "sophia", university: "cal poly")
}


# getProjectId
query gettingProjectIdBytesOfGood {
  getProjectId(project: "Bytes of Good", chapter: "GTech")
}

query gettingProjectIdWorldWildLifeFund {
  getProjectId(project: "world-wildlife-fund", chapter: "UMD")
}

# addProject
query addProjectTestMIT {
  addProject(project: "test", chapter: "MIT")
}

# addMember and deleteMember
query add_and_deleteMemberKaylie {
  addMember(name: "Kaylie", university: "UC Santa Cruz")
}

# deleteMemberId
query deletingMemberKaylie {
  deleteMemberById(memberId: 87) # pick a number from the Member table
}

# addMemberProject
query addMemberProjectSophiaMIT {
  addMemberProject(memberId: 2, projectId: 70)
}