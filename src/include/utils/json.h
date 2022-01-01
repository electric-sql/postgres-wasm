/*-------------------------------------------------------------------------
 *
 * json.h
 *	  Declarations for JSON data type support.
 *
 * Portions Copyright (c) 1996-2021, PostgreSQL Global Development Group
 * Portions Copyright (c) 1994, Regents of the University of California
 *
 * src/include/utils/json.h
 *
 *-------------------------------------------------------------------------
 */

#ifndef JSON_H
#define JSON_H

#include "lib/stringinfo.h"

/* functions in json.c */
extern void escape_json(StringInfo buf, const char *str);
extern char *JsonEncodeDateTime(char *buf, Datum value, Oid typid,
								const int *tzp);
extern void add_json(Datum val, bool is_null, StringInfo result,
					 Oid val_type, bool key_scalar);

#endif							/* JSON_H */
