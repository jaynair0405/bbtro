SELECT COUNT(*) AS row_count
FROM suburban_train_master;

SELECT service_type, COUNT(*) AS train_count
FROM suburban_train_master
GROUP BY service_type
ORDER BY service_type;

SELECT line_group, COUNT(*) AS train_count
FROM suburban_train_master
GROUP BY line_group
ORDER BY line_group;

SELECT car_composition, COUNT(*) AS train_count
FROM suburban_train_master
GROUP BY car_composition
ORDER BY car_composition;

SELECT ac_service, COUNT(*) AS train_count
FROM suburban_train_master
GROUP BY ac_service
ORDER BY ac_service;

SELECT train_code, train_number, service_type, line_group, direction,
       from_station, to_station, car_composition, ac_service, source_note
FROM suburban_train_master
WHERE normalized_train_number IN ('A59', 'A28', 'TL20', 'T54')
ORDER BY train_code;

SELECT normalized_train_number, COUNT(*) AS code_count,
       GROUP_CONCAT(train_code ORDER BY train_code) AS train_codes
FROM suburban_train_master
GROUP BY normalized_train_number
HAVING COUNT(*) > 1
ORDER BY normalized_train_number;
