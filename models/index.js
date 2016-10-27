// models/index.js
'use strict';

var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack');
var marked = require('marked');

var Page = db.define('page', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('open', 'closed')
	},
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
	},
  tags: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    set: function(value){
      var arrayOfTags;
      if(typeof value === 'string'){
        arrayOfTags = value.split(',').map(function(str){
          return str.trim();
        });
          this.setDataValue('tags', arrayOfTags);
      } else {
          this.setDataValue('tags', value);
      }
    }
  }
}, {
	getterMethods: {
  		route: function(){
        var uri = this.urlTitle;
  		  return '/wiki/' + uri;
      }
		},
    hooks: {
      beforeValidate: function(page){  // instance itself
        if(page.title){
          page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g,'');
        }
      }
    },
    classMethods: {
      findByTag: function(tag){
        return Page.findAll({
          where: {
            tags: {
              $overlap: [tag]
            }
          }
        });
      },
      instanceMethods: {
        findSimilar: function(){
          return Page.findAll({
            where: {
              tags: {
                $overlap: this.tags
              },
              id: {
                $ne: this.id
              }
            }
          })

        }
      }
    }
});


var User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    isEmail: true,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  }
});

Page.belongsTo(User, {as: 'author'});

module.exports = {
	Page: Page,
	User: User
};
