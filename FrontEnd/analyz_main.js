const host = "http://3.21.34.165:8080"; 

const Url_for_diff_selection = { "NE_Total":`${host}/backend/Entire_NE`,
							  "State_Total":`${host}/backend/Entire`,
							 "State_Single":`${host}/backend/Individual`,
							 	"NE_Single":`${host}/backend/Entire_NE/Individual` };

let current_url;
let api_data = {}; 
let NE_selected = false;
let err_ocuured=false;


const LoadingScreen=()=>{
	$(".loading_screen").hide();
	$(".main_content").show();
}


$(".analyse_form_btn").on('click',function(e){
	err_ocuured=false;
	$(".alert").removeClass("show");
	e.preventDefault();
	document.querySelector(".analyz_content").style.display = "none";
	$( ".cluster_ul" ).empty();
	$('.bar_plot').hide();

	//Checking which one of the selction is selected
	const selection = $('.checkbox:checked').val();
	//If non selected show err
	if(!selection){
		$(".alert").addClass("show");
		$(".alert_text").text("Please choose a option");
	}
	else{
		//Displaying the loading container while data is arriving from the backend
		$('.loading_container').show();


		//Selecting the api_url based on selction value
		Object.entries(Url_for_diff_selection).forEach(([key, value]) => {
		 if(selection == key ){
			 if(key == "State_Single"){
			 	NE_selected = false;
			 	current_url=value;
			 	let selected_state= $("#State_Single_State").val();
			 	let selected_crime= $("#State_Single_Crime").val();
			 	//if state or crime is not selected
			 	if(selected_state == "selected disabled" || selected_crime == "selected disabled") {
			 		$('.loading_container').hide();
			 		$(".alert").addClass("show");
			 		$(".alert_text").text("Please select both state and crime");
			 		err_ocuured=true;
			 	}
			 	api_data={};
			 	api_data={state:selected_state, crime:selected_crime};
			 }
			 else if(key == "State_Total"){
			 	NE_selected = false;
			 	current_url=value;
			 	let selected_state= $("#State_Total").val();
			 	if(selected_state == "selected disabled") {
			 		$('.loading_container').hide();
			 		$(".alert").addClass("show");
			 		$(".alert_text").text("Please select a state ");
			 		err_ocuured=true;
			 	}
			 	api_data={};
			 	api_data={state:selected_state};
			 } 
			 else if(key == "NE_Single"){
			 	NE_selected = true;
			 	current_url=value;
			 	let selected_crime= $("#NE_Single_Crime").val();
			 	if(selected_crime == "selected disabled") {
			 		$('.loading_container').hide();
			 		$(".alert").addClass("show");
			 		$(".alert_text").text("Please select a crime");
			 		err_ocuured=true;
			 	}
			 	api_data={};
			 	api_data={crime:selected_crime};
			 } 
			 else {
			 	NE_selected = true;
			 	current_url=value;
			 	api_data={};
			 }
		 }

		});




		if(!err_ocuured){
		//Calling the api with selected url and along with the data 
		$.ajax({
					data : {...api_data,name:"Biswajit"},
							type : 'POST',
							url : current_url
						})
						.done(function(data){
							const changed_data=split_data(api_data["crime"]);
							if(!NE_selected){
								$(".content_header h2").text("District wise Analysis");
								$(".content_header_crime").text(changed_data);
								document.querySelector(".visualize_link").href = `visualize/${api_data["state"]}${api_data["crime"]}.html`;
							}
							else{
								$(".content_header h2").text("State wise Analysis");
								$(".content_header_crime").text(changed_data);
								document.querySelector(".visualize_link").href = `visualize/NE${api_data["crime"]}.html`; 
							}


							document.querySelector(".analyz_content").style.display = "block";
							//Hiding the loading container
							$('.loading_container').hide();

							//Auto scrool to analyz_content
							$('html, body').animate({
						         scrollTop: $(".analyz_content").offset().top
						     }, 1000);
							create_insert_elements(data);
						})
						.fail(function(jqXHR, textStatus, error){

							$('.loading_container').hide();
				 			$(".alert").addClass("show");
				 			$(".alert_text").text("Some error occured at backend");
				 			console.log(error);

						});
		}
  	}

});	


	





	


const  create_insert_elements = data =>{

	//Iterating through the data obj fron the backend
	Object.entries(data).forEach(([key, value]) => {
		const li = Create_li(key,value);
		
		$(`.${value}`).append(li); //Selecting the parent ul based on cuurent cluster value
		
	});
};


const Create_li=(data,cluster)=>{
	const changed_data=split_data(data);

	return $(`<li class="collapse_list_item d-flex justify-content-lg-between mb-1 mt-1">
                              <p class="text-capitalize">${changed_data}</p>
                              <button class="btn btn-sm btn-warning" id="${data}">Analyse</button>
                            </li>
                            <hr>`);
}







const split_data=(data)=>{
	let changed_data=data.toLowerCase();
							//Removing the _ and replacing with space
							let data_temp= changed_data.split("_");
							if(data_temp[1]) changed_data=data_temp[0]+" "+data_temp[1];

							return changed_data;
}














//Barplot functionalities
//Year wise analysis
	$('.clusters').on('click', function(ev){
	  if(ev.target.tagName == 'BUTTON'){
	  	$('.loading_container_bar_plot').show();
	  	$('.bar_plot').hide();
		
		//Auto scrool to bar_plot
						$('html, body').animate({
					         scrollTop: $(".bar_plot_block").offset().top
					     }, 700);

		console.log("clicked");
		total_data=[];
		top_data=[]; 
		second_top_data=[];
		let State_selected = api_data["state"]; 
		

		if(!NE_selected){

			target_district = ev.target.id;
			// console.log('dist',target_district)
			$.ajax({
				data : {
					district : target_district,
					state : State_selected
				},
				type : 'POST',
				url : `${host}/backend/Entire/year`
			})
			.done(function(data){
	  			$('.loading_container_bar_plot').hide();

				$('.bar_plot').show();
				top_crime = data["top_crime_list"]["top"];
				second_top_crime = data["top_crime_list"]["Second_top"]; 
				total_obj= data["total"];
				// console.log(total_obj);
				top_obj=data["top_crime"];
				second_obj= data["second_top_crime"];



				for (let obj in total_obj){
					//Getting the total crime data
					temp_obj={ y:total_obj[obj], label: obj.toString(10)};
					total_data.push(temp_obj);
				}
				
				for (let obj in top_obj){
					//Getting the top crime data
					temp_obj = { y:top_obj[obj], label: obj.toString(10)};
					top_data.push(temp_obj);
				}

				for (let obj in second_obj){
					//Getting the top crime data
					temp_obj = { y:second_obj[obj], label: obj.toString(10)};
					second_top_data.push(temp_obj);
				}
				console.log(total_data,top_data,second_top_data);

				district_name=target_district.toLowerCase();
				bar_plot(total_data,top_data,second_top_data,top_crime,second_top_crime,district_name,State_selected);

			})
			.fail(function(jqXHR, textStatus, error){

							$('.loading_container_bar_plot').hide();
				 			$(".alert").addClass("show");
				 			$(".alert_text").text("Some error occured at backend");
				 			console.log(error);

						});
		}

		else {

			
			// console.log('dist',target_district)
			State_selected = ev.target.id;
			//Making data state data to be recognized by backend ie ASSAM to Assam
			if(State_selected == "ARUNACHAL_PRADESH") State_selected=ARUNACHAL;
			State_selected = State_selected.toLowerCase();
			First_letter= State_selected.charAt(0).toUpperCase();
			substring = State_selected.substring(1);
			State_selected = First_letter+substring;
			$.ajax({
				data : {
					state : State_selected
				},
				type : 'POST',
				url : `${host}/backend/Entire_NE/year`
			})
			.done(function(data){
	  			$('.loading_container_bar_plot').hide();
				$('.bar_plot').show();
				top_crime = data["top_crime_list"]["top"];
				second_top_crime = data["top_crime_list"]["Second_top"]; 
				total_obj= data["total"];
				// console.log(total_obj);
				top_obj=data["top_crime"];
				second_obj= data["second_top_crime"];



				for (let obj in total_obj){
					//Getting the total crime data
					temp_obj={ y:total_obj[obj], label: obj.toString(10)};
					total_data.push(temp_obj);
				}
				
				for (let obj in top_obj){
					//Getting the top crime data
					temp_obj = { y:top_obj[obj], label: obj.toString(10)};
					top_data.push(temp_obj);
				}

				for (let obj in second_obj){
					//Getting the top crime data
					temp_obj = { y:second_obj[obj], label: obj.toString(10)};
					second_top_data.push(temp_obj);
				}
				console.log(total_data,top_data,second_top_data);

				district_name= State_selected;
				bar_plot(total_data,top_data,second_top_data,top_crime,second_top_crime,district_name,State_selected);

			})
			.fail(function(jqXHR, textStatus, error){

							$('.loading_container_bar_plot').hide();
				 			$(".alert").addClass("show");
				 			$(".alert_text").text("Some error occured at backend");
				 			console.log(error);

						});

		}
	  }
	});






//BarPlot function
function bar_plot(total_obj,top_obj,second_obj,top_crime,second_top_crime,district,state){


    var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      title:{
        text: `Year-Wise analysis of crime in ${district} district of ${state}`
      },
      axisY: {
        title: "Crime Analysis"
      },
      legend: {
        cursor:"pointer",
        itemclick : toggleDataSeries
      },
      toolTip: {
        shared: true,
        content: toolTipFormatter
      },
      data: [{
        type: "bar",
        showInLegend: true,
        name: "Total Crime ",
        color: "gold",
        dataPoints: total_obj
      },
      {
        type: "bar",
        showInLegend: true,
        name: top_crime,
        color: "silver",
        dataPoints: top_obj
      },
      {
        type: "bar",
        showInLegend: true,
        name: second_top_crime,
        color: "#A57164",
        dataPoints: second_obj
      }]
    });
    chart.render();

    function toolTipFormatter(e) {
      var str = "";
      var total = 0 ;
      var str3;
      var str2 ;
      for (var i = 0; i < e.entries.length; i++){
        var str1 = "<span style= \"color:"+e.entries[i].dataSeries.color + "\">" + e.entries[i].dataSeries.name + "</span>: <strong>"+  e.entries[i].dataPoint.y + "</strong> <br/>" ;
        total = e.entries[i].dataPoint.y + total;
        str = str.concat(str1);
      }
      str2 = "<strong>" + e.entries[0].dataPoint.label + "</strong> <br/>";
      str3 = "<span style = \"color:Tomato\">Total: </span><strong>" + total + "</strong><br/>";
      return str2.concat(str);
    }

    function toggleDataSeries(e) {
      if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      }
      else {
        e.dataSeries.visible = true;
      }
      chart.render();
    }

  
}



