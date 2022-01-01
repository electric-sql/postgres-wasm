/*-------------------------------------------------------------------------
 *
 * getpeereid.c
 *		get peer userid for UNIX-domain socket connection
 *
 * Portions Copyright (c) 1996-2021, PostgreSQL Global Development Group
 *
 *
 * IDENTIFICATION
 *	  src/port/getpeereid.c
 *
 *-------------------------------------------------------------------------
 */

#include "c.h"

#include <sys/param.h>
#include <sys/socket.h>
#include <unistd.h>
#ifdef HAVE_SYS_UN_H
#include <sys/un.h>
#endif
#ifdef HAVE_UCRED_H
#include <ucred.h>
#endif
#ifdef HAVE_SYS_UCRED_H
#include <sys/ucred.h>
#endif


/*
 * BSD-style getpeereid() for platforms that lack it.
 */
int
getpeereid(int sock, uid_t *uid, gid_t *gid)
{
}
