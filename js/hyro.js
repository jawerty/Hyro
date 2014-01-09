/*
Hyro Editor
Last change Oct 2013
Developer: Jared Wright @jawerty 
*/

//require's and global variables
var gui = require('nw.gui');
var fs = require('fs');
var util = require('util');
var color = "#E36D6D";
var default_color = "#E36D6D";

//change directory settings per user platform
if (process.platform === 'darwin') {
	gui.Window.get().menu = new gui.Menu({ type: 'menubar' });
	console.log('mac')
	baseDIR = process.env.HOME

} else if (process.platform === 'win32') {
	gui.Window.get().menu = new gui.Menu({ type: 'menubar' });
	console.log('windows')
	baseDIR = process.env.HOME

} else {
	var user_menu = new gui.Menu({ type: 'menubar' });
	gui.Window.get().menu = user_menu;
	console.log('not windows or mac')
	baseDIR = process.env.HOME
}

console.log(baseDIR)
function checkHex(value){
	return /^#([A-Fa-f0-9]{3}$)|([A-Fa-f0-9]{6}$)/.test(value)
}

//saveAction will be used for hotkeys (future) as well as the 'Save' menu item
function saveAction() {
	e = $(".file-tab[title=selected]").find("span").text();

	if (e[e.length - 1] == "*") {
		$(".file-tab[title=selected]").find("span").text(e.substring(0, e.length - 1))
	}

	selected = $(".file-tab[title=selected]")

	if (selected.attr("alt") == "open") {
		path = $(".file-tab[title=selected]").find("label")[0].innerText;
	} else {
		path = baseDIR + $(".file-tab[title=selected]").find("label")[0].innerText;
		console.log(path);
		$(file_tab).attr("alt", "open");
	}
	
	text = $(".file-tab[title=selected]").find("code")[0].innerText;
	file = $(".file-tab[title=selected]").find("span")[0].innerText;

	fs.openSync(path, 'w');
	fs.writeFile(path, text, function(err){
		if (err) throw err;
		console.log("saved "+ file + " " + path);

		$(".file-tab[title=selected]").find("span").text(file);
		$(".file-tab[title=selected]").find("code").text(text)
	});
} 

//used to trigger the file input dialog		
function chooseFile(name) {
	var chooser = $(name);

	chooser.trigger('click');  
}

//will append a new file tab with the file name + code
function appendFile(text, path, opened) {
	var file = path.split('/').pop();
	amount = 0;
	for (i=0; i<$(".file-tab").length; i++) {
		if ($(".file-tab")[i].id.slice(0, $(".file-tab")[i].id.length-1) == file) {
			amount++;
		}
	}

	file_tab = document.createElement('div');
	$(file_tab).attr("class", "file-tab");
	$(file_tab).attr("id", file+amount);
	if (opened == true) $(file_tab).attr("alt", "open");
	
	span = document.createElement('span')
	$(span).text(file)

	file_path = document.createElement('label');
	$(file_path).css("display", "none");
	$(file_path).text(path);

	code = document.createElement('code');
	$(code).css("display", "none");
	$(code).text(text);


	$(file_tab).append($(span));
	$(file_tab).append($(code));
	$(file_tab).append($(file_path));
	$("#file-nav").append($(file_tab));
}


//central functions init() and main()

$(document).ready(function(){	
	(function init() {
		console.log('initialized');
	})();


	(function main(){
		var menu = new gui.Window.get().menu;

		/**menu item creation and handling**/
		fileItem = new gui.MenuItem({
			type: "normal",
			label: "File"
		});

		viewItem = new gui.MenuItem({
			type: "normal",
			label: "View"
		});

		/**submenu creation and handling**/
		var fileSubmenu = new gui.Menu();

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'New File',
			click: function() {
				appendFile("<!DOCTYPE html>\n<html>\n<head>\n\n</head>\n<body>\n\n</body>\n</html>", "/untitled.html", false);
      			$(".file-tab").trigger("click");
			}
		}));

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'Open',
			click: function() {
				chooseFile('#openDialog');

				var x = 0
				openDialog = $('#openDialog')
				$('#openDialog').change(function(e) {
					
					var paths = [];
					var files = $('#openDialog')[0].files;

					for (var i = 0; i < files.length; i++) {
		  				paths.push(files[i].path);
		  			}

		  			paths.forEach(function(path){
		  				x+=1;
		  				if (x>1) return false;
		  				console.log(path);
		  				buffer_data = fs.readFileSync(path);
		  				text = buffer_data + '';
						appendFile(text, path, true);
						openDialog.replaceWith(openDialog=openDialog.clone(true));
						return true;
		  			}); 
				})
			} 
		}));

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'Save',
			click: saveAction
		}));

		save = new gui.MenuItem({ 
			label: 'Save As',
			click: function() {
				e = $(".file-tab[title=selected]").find("span").text();

				if (e[e.length - 1] == "*") {
					$(".file-tab[title=selected]").find("span").text(e.substring(0, e.length - 1))
				}

				saveDialog = $("#saveDialog");
				path = $(".file-tab[title=selected]").find("label")[0].innerText;
				saveDialog.attr("nwworkingdir", path)

				chooseFile('#saveDialog');
				
				
				$("#saveDialog").change(function(e){
					var files = $('#saveDialog')[0].files;
					new_path = files[0].path;
					new_name = files[0].name;
					text = $(".file-tab[title=selected]").find("code")[0].innerText;
					console.log("\n"+text+"\n")
					fs.writeFile(new_path, text, function(err){
						if (err) throw err;
						console.log("saved "+ new_name + " " + new_path);


						$(".file-tab[title=selected]").find("span").text(new_name);
						$(".file-tab[title=selected]").find("label").text(new_path);
						$(".file-tab[title=selected]").find("code").text(text)
						saveDialog.replaceWith(saveDialog=saveDialog.clone(true));

					});

				});
			}
		});

		fileSubmenu.append(save);

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'New Window',
			click: function() {
				var win = gui.Window.get();

				new_win = gui.Window.open('index.html', {});
			} 
		}));

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'Close Window',
			click: function() {
				var win = gui.Window.get();
				win.close()
			}
		}));

		fileSubmenu.append(new gui.MenuItem({ 
			label: 'Close File',
			click: function() {
				$('.file-tab[title=selected]').remove();
				if ($(".file-tab")[0]) {
					return;
				} else {
					appendFile("Enter your code here...", "/untitled.html", false);
	  				$(".file-tab").trigger("click");
					return 0;
				}
			} 
		}));

		fileItem.submenu = fileSubmenu;

		var viewSubmenu = new gui.Menu();

		viewSubmenu.append(new gui.MenuItem({ 
			label: 'Change Color',
			click: function() {
				jPrompt("(HEX only)\ndefault: "+default_color , "", 'Change UI Color', function(r) {
				    if(r) {
				    	if (checkHex(r)) {
					    	color = r;
					    	$('.file-tab[title=selected]').trigger('click');
					    	$("#file-nav").css("background-color", r)
					    	$('.file-tab').hover(function(){
	      						$(this).css('color', r);
	   							return;
	   						});
					    } else {
				    		jAlert("Color hex was invalid (e.g. #000 and #000000)", "Invalid HEX")
				    	}
				    } 
				});
			} 
		}));


		viewItem.submenu = viewSubmenu;

		/*
		context menu creation
		for the 'file tabs'
		*/
		var file_tab_menu = new gui.Menu();

		remove_file = new gui.MenuItem({ 
			label: 'Remove File',
			click: function(event){
				$('.file-tab[title=selected]').remove();
				if ($(".file-tab")[0]) {
					return;
				} else {
					appendFile("Enter your code here...", "/untitled.html", false);
	  				$(".file-tab").trigger("click");
					return 0;
				}
			}
		});
		
		file_tab_menu.append(remove_file);

		rename_file = new gui.MenuItem({ 
			label: 'Rename File',
			click: function() {
				name = $('.file-tab[title=selected]').find('span')[0].innerText.replace("*", '');
				msg = "Rename " + name + "?";
				jPrompt('New name: ', "", msg, function(r) {
			    	if(r) {
				    	$('.file-tab[title=selected]').find('span')[0].innerText = r + "*";
				    	a_path = $(".file-tab[title=selected]").find("label")[0].innerText.split("\\")
				    	a_path.pop()
				    	a_path.push("//"+r)
				    	$(".file-tab[title=selected]").find("label")[0].innerText = a_path.join("\\")
			    	}  
				});
			}
		});

		file_tab_menu.append(rename_file);
		
		$('.file-tab').live('contextmenu', function(ev) { 
		  $(this).trigger('click')
		  file_tab_menu.popup(ev.clientX, ev.clientY);
		  return false;
		});
		
		helpItem = new gui.MenuItem({ 
			type: 'normal',
			label: 'Help'
		});

		var helpSubmenu = new gui.Menu();
		helpSubmenu.append(new gui.MenuItem({
			label: 'About',
			click: function() {
				var new_win = gui.Window.get(
				  window.open('http://jawerty.github.com/Hyro')
				);
			}
		}));
		
		helpSubmenu.append(new gui.MenuItem({
			label: 'Developer\'s Website',
			click: function() {
				var new_win = gui.Window.get(
				  window.open('http://jawerty.github.com/')
				);
			}
		}));
		
		helpSubmenu.append(new gui.MenuItem({
			label: 'Github',
			click: function() {
				var new_win = gui.Window.get(
				  window.open('https://github.com/jawerty/Hyro')
				);
			}
		}));
		
		helpItem.submenu = helpSubmenu
		
		/**menu item insertion**/
		
		if (process.platform == 'win32') {
			gui.Window.get().menu = menu
			menu.insert(fileItem, 0);
			menu.insert(viewItem, 1);
			menu.append(helpItem);
		} else {
			menu.insert(fileItem, 1);
			menu.insert(viewItem, 3);
			menu.append(helpItem);
		}
		
	})();
});

$(document).ready(function(e){

	var mouse = { x: -1, y: -1 };
    $(document).mousemove(function(event) {
        mouse.x = event.pageX;
        mouse.y = event.pageY;
    });

	$(".file-tab").live('click', function(e){

		$(".file-tab").attr("title", "none");
		$(".file-tab").css("color", "#111");
		codeTag = $(this).find("code")[0];
		
		code = codeTag.innerText.toString();
		file = $(this).attr("id").slice(0, $(this).attr("id").length - 1);
		type = file.split('.').pop()

		$("#view-file-name").text(file);

		if (type == "html" || type == "xhtml" || type == "htm") {
			mode = "text/html"
			
		} else if (type == "css") {
			mode = "text/css"
		} else if (type == "js"){
			mode = "javascript"
		} else {
			mode = "text/plain"
		}

		//gen = util.format(codemirror_code, "default", code, mode)
		_default = $("#default");
		_default.html("")

		var codemirror_obj = CodeMirror(document.getElementById("default"), {
	        value: code,
	        mode:  mode,
	        lineNumbers: true,
	        tabMode: "indent",
	        matchBrackets: true,
	        searchMode: 'inline',
	        onCursorActivity: function () {
	          editor.setLineClass(hlLine, null);
	          hlLine = editor.setLineClass(editor.getCursor().line, "activeline");
	        }
	    });

		$(this).attr("title", "selected");
		$(this).css("color", color);
	});

	var code_box = $('#default');
	
	//live updating for html code.
	$("#default").live('keyup', function() {
		code_box_text = "";
		for (i=0;i<$(".CodeMirror-code pre").length;i++) {
	  		code_box_text += $(".CodeMirror-code pre")[i].innerText
	  		code_box_text += "\n"
		}

		console.log(code_box_text)

		$(".file-tab[title=selected] code")[0].innerText = code_box_text;
		
		var doc = document.getElementById("code-view").contentWindow.document;
		doc.open();
		doc.write("");
		doc.write(code_box_text);
		doc.close();  

		e = $(".file-tab[title=selected]").find("span").text();

		if (e[e.length - 1] != "*") {
			$(".file-tab[title=selected]").find("span").text($(".file-tab[title=selected]").find("span").text() + "*");
		}

		var file = $(".file-tab[title=selected]").find("span").text()
		$("#view-file-name").text(file.replace("*", ""));
	}, false);
});
