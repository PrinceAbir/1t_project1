const ebTableDefinitionMeta = {
  "application": "EB.TABLE.DEFINITION",
  "type": "core",
  "columns": 1,
  "fields": {

    /* ================= HEADER ================= */

    "act.desc": {
      "field_name": "act_desc",
      "label": "Act Desc",
      "type": "string",
      "multivalued": false,
      "mandatory": true,
      "max_length": 50
    },

    "product": {
      "field_name": "product",
      "label": "Product",
      "type": "dropdown",
      "mandatory": true,
      "multivalued": false,
      "dropdown": {
        "source": "product",
        "type": "application"
      }
    },

    /* ================= FIELD DEFINITION ================= */

    "field.name.1": {
      "field_name": "field_name_1",
      "label": "Field Name",
      "type": "string",
      "mandatory": true,
      "max_length": 35
    },

    "description.1": {
      "field_name": "description_1",
      "label": "Description",
      "type": "string",
      "mandatory": false,
      "max_length": 100
    },

    "prompt.text.1": {
      "field_name": "prompt_text_1",
      "label": "Prompt Text",
      "type": "string",
      "mandatory": false,
      "max_length": 50
    },

    "tool.tip.1": {
      "field_name": "tool_tip_1",
      "label": "Tool Tip",
      "type": "string",
      "mandatory": false,
      "max_length": 100
    },

    "calculation": {
      "field_name": "calculation",
      "label": "Calculation",
      "type": "string",
      "mandatory": false
    },

    "availability.1.1": {
      "field_name": "availability_1_1",
      "label": "Availability",
      "type": "string",
      "mandatory": false
    },

    "activity.id.1": {
      "field_name": "activity_id_1",
      "label": "Activity Id",
      "type": "dropdown",
      "dropdown": {
        "source": "activity",
        "type": "application"
      },
      "mandatory": false
    },

    "activity.fld.1": {
      "field_name": "activity_fld_1",
      "label": "Activity Fld",
      "type": "string",
      "mandatory": false
    },

    "max.char.1": {
      "field_name": "max_char_1",
      "label": "Max Char",
      "type": "int",
      "mandatory": false
    },

    "min.char.1": {
      "field_name": "min_char_1",
      "label": "Min Char",
      "type": "int",
      "mandatory": false
    },

    "ccy.activity.1": {
      "field_name": "ccy_activity_1",
      "label": "Ccy Activity",
      "type": "dropdown",
      "dropdown": {
        "source": "activity",
        "type": "application"
      },
      "mandatory": false
    },

    "ccy.act.fld.1": {
      "field_name": "ccy_act_fld_1",
      "label": "Ccy Act Fld",
      "type": "string",
      "mandatory": false
    },

    "vetting.table.1.1": {
      "field_name": "vetting_table_1_1",
      "label": "Vetting Table",
      "type": "string",
      "mandatory": false
    },

    "appl.vet.1": {
      "field_name": "appl_vet_1",
      "label": "Appl Vet",
      "type": "dropdown",
      "dropdown": {
        "source": "activity",
        "type": "application"
      },
      "mandatory": false
    },

    "appl.enrich.fld.1": {
      "field_name": "appl_enrich_fld_1",
      "label": "Appl Enrich Fld",
      "type": "string",
      "mandatory": false
    },

    "def.value.1": {
      "field_name": "def_value_1",
      "label": "Def Value",
      "type": "string",
      "mandatory": false
    },

    "fld.property.1": {
      "field_name": "fld_property_1",
      "label": "Fld Property",
      "type": "dropdown",
      "dropdown": {
        "source": "fieldProperty",
        "type": "application"
      },
      "mandatory": false
    },

    "masking.fmt.1": {
      "field_name": "masking_fmt_1",
      "label": "Masking Fmt",
      "type": "string",
      "mandatory": false
    },

    "virtual.table.1": {
      "field_name": "virtual_table_1",
      "label": "Virtual Table",
      "type": "string",
      "mandatory": false
    },

    "sub.assoc.code.1": {
      "field_name": "sub_assoc_code_1",
      "label": "Sub Assoc Code",
      "type": "dropdown",
      "dropdown": {
        "source": "subAssoc",
        "type": "application"
      },
      "mandatory": false
    },

    "rel.date.field.1": {
      "field_name": "rel_date_field_1",
      "label": "Rel Date Field",
      "type": "string",
      "mandatory": false
    },

    "rel.currency.field.1": {
      "field_name": "rel_currency_field_1",
      "label": "Rel Currency Field",
      "type": "string",
      "mandatory": false
    },

    "fld.product.1": {
      "field_name": "fld_product_1",
      "label": "Fld Product",
      "type": "dropdown",
      "dropdown": {
        "source": "fldProduct",
        "type": "application"
      },
      "mandatory": false
    },

    "physical.position.1": {
      "field_name": "physical_position_1",
      "label": "Physical Position",
      "type": "int",
      "mandatory": false
    },

    "field.owner.1": {
      "field_name": "field_owner_1",
      "label": "Field Owner",
      "type": "dropdown",
      "dropdown": {
        "source": "fieldOwner",
        "type": "application"
      },
      "mandatory": false
    },

    "personal.data.1": {
      "field_name": "personal_data_1",
      "label": "Personal Data",
      "type": "dropdown",
      "dropdown": {
        "source": "yesNo",
        "type": "application"
      },
      "mandatory": false
    },

    "attributes.1": {
      "field_name": "attributes_1",
      "label": "Attributes",
      "type": "dropdown",
      "dropdown": {
        "source": "attributes",
        "type": "application"
      },
      "mandatory": false
    },

    "purpose.1": {
      "field_name": "purpose_1",
      "label": "Purpose",
      "type": "dropdown",
      "dropdown": {
        "source": "purpose",
        "type": "application"
      },
      "mandatory": false
    },

    "erase.option.1": {
      "field_name": "erase_option_1",
      "label": "Erase Option",
      "type": "dropdown",
      "dropdown": {
        "source": "eraseOption",
        "type": "application"
      },
      "mandatory": false
    },

    "accessibility.1": {
      "field_name": "accessibility_1",
      "label": "Accessibility",
      "type": "dropdown",
      "dropdown": {
        "source": "accessibility",
        "type": "application"
      },
      "mandatory": false
    },

    /* ================= FOOTER ================= */

    "file.type": {
      "field_name": "file_type",
      "label": "File Type",
      "type": "dropdown",
      "mandatory": true,
      "dropdown": {
        "source": "fileType",
        "type": "application"
      }
    },

    "link.to.wfl": {
      "field_name": "link_to_wfl",
      "label": "Link To WFL",
      "type": "checkbox",
      "mandatory": false
    },

    "ns.operation": {
      "field_name": "ns_operation",
      "label": "Ns Operation",
      "type": "dropdown",
      "dropdown": {
        "source": "nsOperation",
        "type": "application"
      }
    },

    "key.field": {
      "field_name": "key_field",
      "label": "Key Field",
      "type": "string",
      "mandatory": false
    },

    "insert.layout": {
      "field_name": "insert_layout",
      "label": "Insert Layout",
      "type": "string",
      "mandatory": false
    },

    "add.special.fields.1": {
      "field_name": "add_special_fields_1",
      "label": "Add Special Fields",
      "type": "dropdown",
      "multivalued": false,
      "max_multifield": 3,
      "dropdown": {
        "source": "addSpecialFields",
        "type": "application"
      }
    },

    "class.type": {
      "field_name": "class_type",
      "label": "Class Type",
      "type": "dropdown",
      "dropdown": {
        "source": "classType",
        "type": "application"
      }
    },

    "rule.name.1": {
      "field_name": "rule_name_1",
      "label": "Rule Name",
      "type": "string",
      "mandatory": false
    },

    "rule.1": {
      "field_name": "rule_1",
      "label": "Rule",
      "type": "textarea",
      "mandatory": false
    },

    "pgm.type": {
      "field_name": "pgm_type",
      "label": "Pgm Type",
      "type": "dropdown",
      "dropdown": {
        "source": "pgmType",
        "type": "application"
      }
    },

    "table.owner": {
      "field_name": "table_owner",
      "label": "Table Owner",
      "type": "dropdown",
      "dropdown": {
        "source": "tableOwner",
        "type": "application"
      }
    },
     "tabletest": {
      "field_name": "table_owner",
      "label": "Table Test",
      "type": "dropdown",
      "dropdown": {
        "source": "tableOwner",
        "type": "application"
      }
    }
  }
};

export default ebTableDefinitionMeta;
