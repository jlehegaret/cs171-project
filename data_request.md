Data Request

Five JSON Files:

1. list of working groups (including a dummy one for Infrastructure?)
2. GitHub web platform test pull requests
3. GitHub web platform test issues
4. GitHub W3 specs
5. Caniuse data export

### 1. list of working groups

array of { name :  name  
           specs : [ {  spec:  spec  
                        status: "WD", "CR", "REC", etc  
                        last_pub: mm-dd-y  
                        yyy (or whatever date format)  
                      }  
                   ]  
         }  

### 2. GitHub web platform test pull requests

array of {  type: "test"  
            url: url  
            title: title  
            status:  "done" or "pending"  
            spec:  spec (or "Infrastructure" or "UNASSIGNED")  
            num_lines: lines of code affected:  additions + deletions
            author: who opened it  
            closer: who closed it  
            author_date: date opened  
            closer_date: date merged  
         }
  
### 3. GitHub web platform test issues

array of {  type: "issue"
            url: url  
            title: title  
            status:  "done" or "pending"  
            spec:  spec (or "Infrastructure" or "UNASSIGNED")  
            difficulty: "easy", "medium", "hard" (or "UNASSIGNED")  
            author: who opened it  
            closer: who closed it  
            author_date: date opened  
            closer_date: date closed  
         }

### 4. GitHub W3 Specs

array of { spec: spec  
           url: url  
           pull_reqs:  array of { same as above }  
           issues: array of { same as above }  
          }

### 5. CanIUse data export

array of { name: feature-name  
           spec: spec  
           url: url
           support: array of { browser: browser-name  
                               score: 1 (yes)  
                                      2 (partial)  
                                      3 (no/unknown)  
                               (as of latest version noted)
                              }  
          }
