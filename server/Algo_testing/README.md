NOTES AND RESCOURCES FOR SHIFTTREE SCHEDULING ALGORITHM:


    --LINKS:
stackoverflow discussion-- https://stackoverflow.com/questions/17140179/optimal-shift-scheduling-algorithm
google OR tools CP-SAT info-- https://developers.google.com/optimization/cp/cp_solver
more sophisticated solution using OR tools-- https://developers.google.com/optimization/cp/cp_solver
google OR tools shceduling problem solutions-- https://developers.google.com/optimization/scheduling/employee_scheduling



    --CONSIDERATIONS:

- fairness: How do tie breaks occur? [first come first serve, random, rotating, cumulative discrepancy, provide multiple schedule options to the manager]. Could make discrepancies weighted to make it more fair for employees requesting less hours. Could add desired hours field -->  min( avg(hours_desired - hours_scheduled) )  ||  min( max(hours_desired - hours_scheduled) )

- potential constraint, no emloyee should work two shifts in a row. Or set a certain amount of time between shifts an employee cannot be scheduled

- include a way to handle new employees. Ex: no more than one newvie per shift. [if so, maybe add a way to see your status in a shift tree, and a way to request a change. Maybe you have been a newbie for a while and want to request a status change]