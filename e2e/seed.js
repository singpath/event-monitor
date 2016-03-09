'use strict';

// Built from a firebase dump, in JSON format; allow double quote to ease update
// jscs:disable validateQuoteMarks
// jscs:disable maximumLineLength
/* eslint quotes: 0 */
exports.factory = extension => Object.assign({
  "auth": {
    "publicIds": {
      "alice": "google:alice",
      "bob": "google:bob"
    },
    "usedPublicIds": {
      "alice": true,
      "bob": true
    },
    "users": {
      "google:bob": {
        "country": {
          "code": "GB",
          "name": "United Kingdom"
        },
        "createdAt": 1457221423118,
        "displayName": "Alice",
        "email": "alice@example.com",
        "fullName": "Alice Kingsley",
        "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "id": "google:bob",
        "publicId": "bob"
      },
      "google:alice": {
        "country": {
          "code": "GB",
          "name": "United Kingdom"
        },
        "createdAt": 1457217899258,
        "displayName": "Bob",
        "email": "bob@example.com",
        "fullName": "Bob Smith",
        "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "id": "google:alice",
        "publicId": "alice"
      }
    }
  },
  "classMentors": {
    "admins": {
      "google:alice": true
    },
    "badges": {
      "codeCombat": {
        "dungeons-of-kithgard": {
          "iconUrl": "/assets/icons/commanding_followers_1.png",
          "id": "dungeons-of-kithgard",
          "name": "Dungeons of Kithgard",
          "url": "http://codecombat.com/play/level/dungeons-of-kithgard"
        },
        "gems-in-the-deep": {
          "iconUrl": "/assets/icons/commanding_followers_2.png",
          "id": "gems-in-the-deep",
          "name": "Gems in the Deep",
          "url": "http://codecombat.com/play/level/gems-in-the-deep"
        }
      },
      "codeSchool": {
        "javascript-road-trip-part-1-level-1-on-javascript-road-trip-part-1": {
          "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/297/level-1-on-javascript-road-trip-part-1-ff645bd94243922a90b775da5ee2647c.png",
          "id": "javascript-road-trip-part-1-level-1-on-javascript-road-trip-part-1",
          "name": "Level 1 on JavaScript Road Trip Part 1",
          "url": "https://www.codeschool.com/courses/javascript-road-trip-part-1"
        },
        "javascript-road-trip-part-1-level-2-on-javascript-road-trip-part-1": {
          "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/298/level-2-on-javascript-road-trip-part-1-e568b2c31b1fd0da0dc94cc4d5452150.png",
          "id": "javascript-road-trip-part-1-level-2-on-javascript-road-trip-part-1",
          "name": "Level 2 on JavaScript Road Trip Part 1",
          "url": "https://www.codeschool.com/courses/javascript-road-trip-part-1"
        },
        "javascript-road-trip-part-1-level-3-on-javascript-road-trip-part-1": {
          "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/299/level-3-on-javascript-road-trip-part-1-ae7652ab8f363e27fea8afe06cee30e3.png",
          "id": "javascript-road-trip-part-1-level-3-on-javascript-road-trip-part-1",
          "name": "Level 3 on JavaScript Road Trip Part 1",
          "url": "https://www.codeschool.com/courses/javascript-road-trip-part-1"
        }
      }
    },
    "eventApplications": {
      "someEventId": {
        "google:bob": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "google:alice": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      }
    },
    "eventParticipants": {
      "someEventId": {
        "alice": {
          "user": {
            "displayName": "Alice",
            "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
          }
        },
        "bob": {
          "user": {
            "displayName": "Bob",
            "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
          }
        }
      }
    },
    "eventPasswords": {
      "someEventId": {
        "hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "options": {
          "hasher": "PBKDF2",
          "iterations": 1012,
          "keySize": 8,
          "prf": "SHA256",
          "salt": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }
      }
    },
    "eventProgress": {
      "someEventId": {
        "bob": {
          "someLinkTaskId": {
            "completed": true
          },
          "someTextTaskId": {
            "completed": true
          },
          "someSingPathTaskId": {
            "completed": true
          },
          "someCodeSchoolTaskId": {
            "completed": true
          },
          "someCodeCombatTaskId": {
            "completed": true
          }
        }
      }
    },
    "eventRankings": {
      "someEventId": {
        "alice": {
          "codeCombat": 0,
          "codeSchool": 0,
          "singPath": 0,
          "total": 0,
          "user": {
            "country": {
              "code": "GB",
              "name": "United Kingdom"
            },
            "displayName": "Alice",
            "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "isAdmin": true,
            "isPremium": true
          }
        },
        "bob": {
          "codeCombat": 2,
          "codeSchool": 2,
          "singPath": 1,
          "total": 5,
          "user": {
            "displayName": "Bob",
            "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
          }
        }
      }
    },
    "eventSolutions": {
      "someEventId": {
        "bob": {
          "someLinkTaskId": "github.com",
          "someTextTaskId": "Yes",
          "someSingPathTaskId": true,
          "someCodeSchoolTaskId": true,
          "someCodeCombatTaskId": true
        }
      }
    },
    "eventTasks": {
      "someEventId": {
        "someLinkTaskId": {
          "archived": false,
          "description": "Github link",
          "linkPattern": "github.com",
          "openedAt": 1457221126450,
          "priority": 1,
          "title": "Link please"
        },
        "someTextTaskId": {
          "archived": false,
          "description": "Yes / No ?",
          "openedAt": 1457221635949,
          "priority": 3,
          "textResponse": "Yes / No ?",
          "title": "Answer please"
        },
        "someSingPathTaskId": {
          "archived": false,
          "description": "Some problem",
          "openedAt": 1457221739658,
          "priority": 3,
          "serviceId": "singPath",
          "singPathProblem": {
            "level": {
              "id": "someLevelId",
              "title": "Level 1",
              "url": "http://www.singpath.com/#/paths/somePathId/levels/someLevelId/problems"
            },
            "path": {
              "id": "somePathId",
              "title": "Java",
              "url": "http://www.singpath.com/#/paths/somePathId/levels"
            },
            "problem": {
              "id": "someProblemId",
              "title": "int",
              "url": "http://www.singpath.com/#/paths/somePathId/levels/someLevelId/problems/someProblemId/play"
            }
          },
          "title": "Singpath"
        },
        "someCodeSchoolTaskId": {
          "archived": false,
          "badge": {
            "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/297/level-1-on-javascript-road-trip-part-1-ff645bd94243922a90b775da5ee2647c.png",
            "id": "javascript-road-trip-part-1-level-1-on-javascript-road-trip-part-1",
            "name": "Level 1 on JavaScript Road Trip Part 1",
            "url": "https://www.codeschool.com/courses/javascript-road-trip-part-1"
          },
          "description": "some CS",
          "openedAt": 1457223586086,
          "serviceId": "codeSchool",
          "title": "Code School"
        },
        "someCodeCombatTaskId": {
          "archived": false,
          "badge": {
            "iconUrl": "/assets/icons/commanding_followers_2.png",
            "id": "gems-in-the-deep",
            "name": "Gems in the Deep",
            "url": "http://codecombat.com/play/level/gems-in-the-deep"
          },
          "description": "some badge",
          "openedAt": 1457226147790,
          "serviceId": "codeCombat",
          "title": "Code Combat"
        }
      }
    },
    "events": {
      "someEventId": {
        "createdAt": 1457218024517,
        "owner": {
          "displayName": "Alice",
          "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "publicId": "alice"
        },
        "title": "Test Event"
      }
    },
    "premiumUsers": {
      "google:alice": true
    },
    "schools": {
      "Admiralty Secondary School": {
        "iconUrl": "/assets/crests/tempbadge.png",
        "id": "Admiralty Secondary School",
        "name": "Admiralty Secondary School",
        "type": "Secondary"
      },
      "Ahmad Ibrahim Secondary School": {
        "iconUrl": "/assets/crests/tempbadge.png",
        "id": "Ahmad Ibrahim Secondary School",
        "name": "Ahmad Ibrahim Secondary School",
        "type": "Secondary"
      }
    },
    "servicesUserIds": {
      "codeCombat": {
        "9012": "bob"
      },
      "codeSchool": {
        "bobCSID": "bob"
      }
    },
    "userProfiles": {
      "alice": {
        "createdEvents": {
          "someEventId": {
            "createdAt": 1457218024517,
            "featured": false,
            "title": "Test Event"
          }
        },
        "joinedEvents": {
          "someEventId": {
            "createdAt": 1457218024517,
            "featured": false,
            "owner": {
              "displayName": "Alice",
              "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              "publicId": "alice"
            },
            "title": "Test Event"
          }
        },
        "user": {
          "country": {
            "code": "GB",
            "name": "United Kingdom"
          },
          "displayName": "Alice",
          "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "isAdmin": true,
          "isPremium": true
        }
      },
      "bob": {
        "joinedEvents": {
          "someEventId": {
            "createdAt": 1457218024517,
            "featured": false,
            "owner": {
              "displayName": "Bob",
              "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              "publicId": "bob"
            },
            "title": "Test Event"
          }
        },
        "services": {
          "codeCombat": {
            "badges": {
              "dungeons-of-kithgard": {
                "iconUrl": "/assets/icons/commanding_followers_1.png",
                "id": "dungeons-of-kithgard",
                "name": "Dungeons of Kithgard",
                "url": "http://codecombat.com/play/level/dungeons-of-kithgard"
              },
              "gems-in-the-deep": {
                "iconUrl": "/assets/icons/commanding_followers_2.png",
                "id": "gems-in-the-deep",
                "name": "Gems in the Deep",
                "url": "http://codecombat.com/play/level/gems-in-the-deep"
              }
            },
            "details": {
              "id": "9012",
              "name": "Bob",
              "registeredBefore": 1457227080105
            },
            "lastUpdate": 1457227080041
          },
          "codeSchool": {
            "badges": {
              "front-end-foundations-level-1-complete-on-front-end-foundations": {
                "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/444/level-1-complete-on-front-end-foundations-a14a15c153bbe32611fca5be835923bf.png",
                "id": "front-end-foundations-level-1-complete-on-front-end-foundations",
                "name": "Level 1 Complete on Front End Foundations",
                "url": "http://www.codeschool.com/courses/front-end-foundations"
              },
              "javascript-road-trip-part-1-level-1-on-javascript-road-trip-part-1": {
                "iconUrl": "https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/297/level-1-on-javascript-road-trip-part-1-ff645bd94243922a90b775da5ee2647c.png",
                "id": "javascript-road-trip-part-1-level-1-on-javascript-road-trip-part-1",
                "name": "Level 1 on JavaScript Road Trip Part 1",
                "url": "http://www.codeschool.com/courses/javascript-road-trip-part-1"
              }
            },
            "details": {
              "id": "bobCSID",
              "name": "Bob",
              "registeredBefore": 1457223663930
            },
            "lastUpdate": 1457223665049
          }
        },
        "user": {
          "country": {
            "code": "GB",
            "name": "United Kingdom"
          },
          "displayName": "Bob",
          "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }
      }
    }
  },
  "meta": {
    "version": 2
  },
  "singpath": {
    "admins": {
      "google:alice": true
    },
    "levels": {
      "somePathId": {
        "someLevelId": {
          "description": "Easy mode",
          "language": "java",
          "owner": {
            "displayName": "Alice",
            "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "publicId": "alice"
          },
          "title": "Level 1"
        }
      }
    },
    "paths": {
      "somePathId": {
        "description": "Java (Beanshell) problems",
        "language": "java",
        "owner": {
          "displayName": "Alice",
          "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "publicId": "alice"
        },
        "title": "Java"
      }
    },
    "problems": {
      "somePathId": {
        "someLevelId": {
          "someProblemId": {
            "description": "Create method returning 1 (int)",
            "language": "java",
            "owner": {
              "displayName": "Alice",
              "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              "publicId": "alice"
            },
            "tests": "import org.junit.Test;\nimport static org.junit.Assert.*;\nimport junit.framework.*;\nimport com.singpath.SolutionRunner;\n\npublic class SingPathTest extends SolutionRunner {\n\n    @Test\n    public void testCapitalize() throws Exception {\n      SingPath sp = new SingPath();\n      assertEquals(1, sp.one());\n    }\n}",
            "title": "int"
          }
        }
      }
    },
    "queuedSolutions": {
      "somePathId": {
        "someLevelId": {
          "someProblemId": {
            "bob": {
              "default": {
                "meta": {
                  "endedAt": 1457221842090,
                  "history": {
                    "1457221768812": 73278
                  },
                  "solved": true,
                  "startedAt": 1457221768812,
                  "taskId": "-KC8BAFJHJFsHPc-Duih",
                  "verified": true
                },
                "payload": {
                  "language": "java",
                  "solution": "public class SingPath {\n    public int one() {\n        return 1;\n    }\n}",
                  "tests": "import org.junit.Test;\nimport static org.junit.Assert.*;\nimport junit.framework.*;\nimport com.singpath.SolutionRunner;\n\npublic class SingPathTest extends SolutionRunner {\n\n    @Test\n    public void testCapitalize() throws Exception {\n      SingPath sp = new SingPath();\n      assertEquals(1, sp.one());\n    }\n}"
                },
                "results": {
                  "-KC8BAFJHJFsHPc-Duih": {
                    "meta": {
                      "runCount": 1,
                      "runTime": 6
                    },
                    "solved": true
                  }
                }
              }
            }
          }
        }
      }
    },
    "queues": {
      "default": {
        "tasks": {
          "-KC8BAFJHJFsHPc-Duih": {
            "completed": true,
            "completedAt": 1457221845268,
            "consumed": true,
            "createdAt": 1457221842090,
            "owner": "google:bob",
            "payload": {
              "language": "java",
              "solution": "public class SingPath {\n    public int one() {\n        return 1;\n    }\n}",
              "tests": "import org.junit.Test;\nimport static org.junit.Assert.*;\nimport junit.framework.*;\nimport com.singpath.SolutionRunner;\n\npublic class SingPathTest extends SolutionRunner {\n\n    @Test\n    public void testCapitalize() throws Exception {\n      SingPath sp = new SingPath();\n      assertEquals(1, sp.one());\n    }\n}"
            },
            "solutionRef": "singpath/queuedSolutions/somePathId/someLevelId/someProblemId/bob/default",
            "started": true,
            "startedAt": 1457221842114,
            "worker": "a3d2bf35-d681-4243-8826-29afa7dc444f"
          }
        },
        "workers": {
          "a3d2bf35-d681-4243-8826-29afa7dc444f": {
            "presence": 1457230084720,
            "startedAt": 1457210329034
          }
        }
      }
    },
    "userProfiles": {
      "bob": {
        "queuedSolutions": {
          "somePathId": {
            "someLevelId": {
              "someProblemId": {
                "default": {
                  "duration": 73278,
                  "language": "java",
                  "solved": true,
                  "startedAt": 1457221768812
                }
              }
            }
          }
        },
        "user": {
          "country": {
            "code": "GB",
            "name": "United Kingdom"
          },
          "displayName": "Bob",
          "gravatar": "//www.gravatar.com/avatar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }
      }
    }
  }
}, extension);
