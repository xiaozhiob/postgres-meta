import { pgMeta } from './utils'

test('query', async () => {
  const res = await pgMeta.query('SELECT * FROM users')
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "id": 1,
          "name": "Joe Bloggs",
          "status": "ACTIVE",
        },
        Object {
          "id": 2,
          "name": "Jane Doe",
          "status": "ACTIVE",
        },
      ],
      "error": null,
    }
  `)
})

test('error', async () => {
  const res = await pgMeta.query('DROP TABLE missing_table')
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": null,
      "error": Object {
        "message": "table \\"missing_table\\" does not exist",
      },
    }
  `)
})

test('parser select statements', async () => {
  const res = await pgMeta.parse('SELECT id, name FROM users where user_id = 1234')
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "RawStmt": Object {
            "stmt": Object {
              "SelectStmt": Object {
                "fromClause": Array [
                  Object {
                    "RangeVar": Object {
                      "inh": true,
                      "location": 21,
                      "relname": "users",
                      "relpersistence": "p",
                    },
                  },
                ],
                "limitOption": "LIMIT_OPTION_DEFAULT",
                "op": "SETOP_NONE",
                "targetList": Array [
                  Object {
                    "ResTarget": Object {
                      "location": 7,
                      "val": Object {
                        "ColumnRef": Object {
                          "fields": Array [
                            Object {
                              "String": Object {
                                "str": "id",
                              },
                            },
                          ],
                          "location": 7,
                        },
                      },
                    },
                  },
                  Object {
                    "ResTarget": Object {
                      "location": 11,
                      "val": Object {
                        "ColumnRef": Object {
                          "fields": Array [
                            Object {
                              "String": Object {
                                "str": "name",
                              },
                            },
                          ],
                          "location": 11,
                        },
                      },
                    },
                  },
                ],
                "whereClause": Object {
                  "A_Expr": Object {
                    "kind": "AEXPR_OP",
                    "lexpr": Object {
                      "ColumnRef": Object {
                        "fields": Array [
                          Object {
                            "String": Object {
                              "str": "user_id",
                            },
                          },
                        ],
                        "location": 33,
                      },
                    },
                    "location": 41,
                    "name": Array [
                      Object {
                        "String": Object {
                          "str": "=",
                        },
                      },
                    ],
                    "rexpr": Object {
                      "A_Const": Object {
                        "location": 43,
                        "val": Object {
                          "Integer": Object {
                            "ival": 1234,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "stmt_len": undefined,
          },
        },
      ],
      "error": null,
    }
  `)
})

test('parser comments', async () => {
  const res = await pgMeta.parse(`
-- test comments
`)
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": Array [],
      "error": null,
    }
  `)
})

test('parser create schema', async () => {
  const res = await pgMeta.parse(`
create schema if not exists test_schema;
`)
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "RawStmt": Object {
            "stmt": Object {
              "CreateSchemaStmt": Object {
                "if_not_exists": true,
                "schemaname": "test_schema",
              },
            },
            "stmt_len": 40,
          },
        },
      ],
      "error": null,
    }
  `)
})

test('parser create statements', async () => {
  const query = `
CREATE TABLE table_name (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  inserted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  data jsonb,
  name text
);
`
  const res = await pgMeta.parse(query)
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "RawStmt": Object {
            "stmt": Object {
              "CreateStmt": Object {
                "oncommit": "ONCOMMIT_NOOP",
                "relation": Object {
                  "inh": true,
                  "location": 14,
                  "relname": "table_name",
                  "relpersistence": "p",
                },
                "tableElts": Array [
                  Object {
                    "ColumnDef": Object {
                      "colname": "id",
                      "constraints": Array [
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_IDENTITY",
                            "generated_when": "d",
                            "location": 39,
                          },
                        },
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_PRIMARY",
                            "location": 72,
                          },
                        },
                      ],
                      "is_local": true,
                      "location": 29,
                      "typeName": Object {
                        "location": 32,
                        "names": Array [
                          Object {
                            "String": Object {
                              "str": "pg_catalog",
                            },
                          },
                          Object {
                            "String": Object {
                              "str": "int8",
                            },
                          },
                        ],
                        "typemod": -1,
                      },
                    },
                  },
                  Object {
                    "ColumnDef": Object {
                      "colname": "inserted_at",
                      "constraints": Array [
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_DEFAULT",
                            "location": 124,
                            "raw_expr": Object {
                              "FuncCall": Object {
                                "args": Array [
                                  Object {
                                    "TypeCast": Object {
                                      "arg": Object {
                                        "A_Const": Object {
                                          "location": 141,
                                          "val": Object {
                                            "String": Object {
                                              "str": "utc",
                                            },
                                          },
                                        },
                                      },
                                      "location": 146,
                                      "typeName": Object {
                                        "location": 148,
                                        "names": Array [
                                          Object {
                                            "String": Object {
                                              "str": "text",
                                            },
                                          },
                                        ],
                                        "typemod": -1,
                                      },
                                    },
                                  },
                                  Object {
                                    "FuncCall": Object {
                                      "funcname": Array [
                                        Object {
                                          "String": Object {
                                            "str": "now",
                                          },
                                        },
                                      ],
                                      "location": 154,
                                    },
                                  },
                                ],
                                "funcname": Array [
                                  Object {
                                    "String": Object {
                                      "str": "timezone",
                                    },
                                  },
                                ],
                                "location": 132,
                              },
                            },
                          },
                        },
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_NOTNULL",
                            "location": 161,
                          },
                        },
                      ],
                      "is_local": true,
                      "location": 87,
                      "typeName": Object {
                        "location": 99,
                        "names": Array [
                          Object {
                            "String": Object {
                              "str": "pg_catalog",
                            },
                          },
                          Object {
                            "String": Object {
                              "str": "timestamptz",
                            },
                          },
                        ],
                        "typemod": -1,
                      },
                    },
                  },
                  Object {
                    "ColumnDef": Object {
                      "colname": "updated_at",
                      "constraints": Array [
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_DEFAULT",
                            "location": 209,
                            "raw_expr": Object {
                              "FuncCall": Object {
                                "args": Array [
                                  Object {
                                    "TypeCast": Object {
                                      "arg": Object {
                                        "A_Const": Object {
                                          "location": 226,
                                          "val": Object {
                                            "String": Object {
                                              "str": "utc",
                                            },
                                          },
                                        },
                                      },
                                      "location": 231,
                                      "typeName": Object {
                                        "location": 233,
                                        "names": Array [
                                          Object {
                                            "String": Object {
                                              "str": "text",
                                            },
                                          },
                                        ],
                                        "typemod": -1,
                                      },
                                    },
                                  },
                                  Object {
                                    "FuncCall": Object {
                                      "funcname": Array [
                                        Object {
                                          "String": Object {
                                            "str": "now",
                                          },
                                        },
                                      ],
                                      "location": 239,
                                    },
                                  },
                                ],
                                "funcname": Array [
                                  Object {
                                    "String": Object {
                                      "str": "timezone",
                                    },
                                  },
                                ],
                                "location": 217,
                              },
                            },
                          },
                        },
                        Object {
                          "Constraint": Object {
                            "contype": "CONSTR_NOTNULL",
                            "location": 246,
                          },
                        },
                      ],
                      "is_local": true,
                      "location": 173,
                      "typeName": Object {
                        "location": 184,
                        "names": Array [
                          Object {
                            "String": Object {
                              "str": "pg_catalog",
                            },
                          },
                          Object {
                            "String": Object {
                              "str": "timestamptz",
                            },
                          },
                        ],
                        "typemod": -1,
                      },
                    },
                  },
                  Object {
                    "ColumnDef": Object {
                      "colname": "data",
                      "is_local": true,
                      "location": 258,
                      "typeName": Object {
                        "location": 263,
                        "names": Array [
                          Object {
                            "String": Object {
                              "str": "jsonb",
                            },
                          },
                        ],
                        "typemod": -1,
                      },
                    },
                  },
                  Object {
                    "ColumnDef": Object {
                      "colname": "name",
                      "is_local": true,
                      "location": 272,
                      "typeName": Object {
                        "location": 277,
                        "names": Array [
                          Object {
                            "String": Object {
                              "str": "text",
                            },
                          },
                        ],
                        "typemod": -1,
                      },
                    },
                  },
                ],
              },
            },
            "stmt_len": 283,
          },
        },
      ],
      "error": null,
    }
  `)

  const deparse = await pgMeta.deparse(res.data!)
  expect(deparse.data).toMatchInlineSnapshot(`
"CREATE TABLE table_name (
 	id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	inserted_at pg_catalog.timestamptz DEFAULT ( timezone('utc'::text, now()) ) NOT NULL,
	updated_at pg_catalog.timestamptz DEFAULT ( timezone('utc'::text, now()) ) NOT NULL,
	data jsonb,
	name text 
);"
`)
})

test('formatter', async () => {
  const res = await pgMeta.format('SELECT id, name FROM users where user_id = 1234')
  expect(res).toMatchInlineSnapshot(`
    Object {
      "data": "SELECT
      id,
      name
    FROM
      users
    where
      user_id = 1234",
      "error": null,
    }
  `)
})