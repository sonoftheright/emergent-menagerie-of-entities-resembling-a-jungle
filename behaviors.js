//behaviors.js

// ONE TICK JOBS - Run the gauntlet here ONLY ONCE PER BEHAVIOR TICK - i.e., once every 5 game frames(?)

// Meta-behavior functions:
// each entity type has a different way of behaving based on status/properties
// but maybe I should be building types as characteristics and setting them up 
// as modules? Hmm. 'Dave is male and mature and has these various other traits.'
// 'Jane is female and mature and has these other traits...'. Hmmm...

/*

*/


//Prioritize Jobs and Needs

function sortJobs(object)
{

}

//Find Sources for Need Satisfaction

/*

	Above: weigh needs and prioritize high-need jobs
	Below: 	
		- a) Check own memories and knowledge 
		- b) Check area and, if successful, add to own memories and knowledge

*/

function findHunger(object)
{

}

function findEnergy(object)
{

}

function findThirst(object)
{

}


//Perform basic actions

function moveToward(mover, dest, speed)
{
  if(mover.x + speed > dest.x && mover.y + speed > dest.y)
  {
    
  }
}

